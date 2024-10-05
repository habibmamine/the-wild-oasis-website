"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { getBookings, getSettings } from "./data-service";
import { supabase } from "./supabase";

import { redirect } from "next/navigation";

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  if (!/^(?=.*[a-zA-Z0-9])[\w\d]{6,12}$/.test(nationalID))
    throw new Error("Please provide a valid national ID");

  const updateData = { nationality, nationalID, countryFlag };

  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId)
    .select()
    .single();

  if (error) throw new Error("Guest could not be updated");

  revalidatePath("/account/profile");
}

export async function createBooking(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const { breakfastPrice } = await getSettings();

  const hasBreakfast = formData.get("hasBreakfast") === "on";
  const extrasPrice = hasBreakfast
    ? breakfastPrice * bookingData.numNights * Number(formData.get("numGuests"))
    : 0;
  const totalPrice = extrasPrice + bookingData.cabinPrice;

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: +formData.get("numGuests"),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice,
    totalPrice,
    hasBreakfast,
    isPaid: false,
    status: "unconfirmed",
  };

  const { error } = await supabase.from("bookings").insert([newBooking]);

  if (error) throw new Error("Booking could not be created");

  revalidatePath(`/cabins/${bookingData.cabinId}`);

  redirect("/cabins/thankyou");
}

export async function deleteReservation(bookingId) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingsIds = guestBookings.map((booking) => booking.id);

  // TO AVOID DELETING USING CURL OF THIS ACTION
  if (!guestBookingsIds.includes(bookingId)) throw new Error("You are not allowed to delete this");

  const { error } = await supabase.from("bookings").delete().eq("id", bookingId);

  if (error) throw new Error("Booking could not be deleted");

  revalidatePath("/account/reservations");
}

export async function updateReservation(breakfastData, formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  // TO AVOID UPDATING USING CURL OF THIS ACTION
  const guestId = formData.get("guestId");

  if (Number(guestId) !== Number(session.user.guestId))
    throw new Error("You are not allowed to update this");

  const reservationId = formData.get("reservationId");
  const numGuests = formData.get("numGuests");
  const observations = formData.get("observations");

  const { error } = await supabase
    .from("bookings")
    .update({ ...breakfastData, numGuests, observations })
    .eq("id", reservationId)
    .select()
    .single();

  if (error) throw new Error("Booking could not be updated");

  revalidatePath(`/account/reservations/edit/${reservationId}`);
  redirect("/account/reservations");
}
