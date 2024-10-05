import SubmitButton from "@/app/_components/SubmitButton";
import { updateReservation } from "@/app/_lib/actions";
import { getBooking, getCabin, getSettings } from "@/app/_lib/data-service";

export default async function Page({ params }) {
  const { reservationId } = params;

  const {
    cabinId,
    guestId,
    numGuests,
    observations,
    hasBreakfast,
    numNights,
    totalPrice,
    cabinPrice,
    extrasPrice,
  } = await getBooking(reservationId);
  const { maxCapacity, regularPrice, discount } = await getCabin(cabinId);

  async function handleSubmit(formData) {
    "use server";
    let newCabinPrice = cabinPrice;
    let newExtrasPrice = extrasPrice;
    let newTotalPrice = totalPrice;
    const hasIt = formData.get("hasBreakfast") === "on";

    if (hasIt) {
      const { breakfastPrice } = await getSettings();
      newExtrasPrice = Number(formData.get("numGuests")) * numNights * breakfastPrice;
    } else {
      newExtrasPrice = 0;
    }
    newCabinPrice = (regularPrice - discount) * numNights;
    newTotalPrice = newCabinPrice + newExtrasPrice;

    await updateReservation(
      {
        cabinPrice: newCabinPrice,
        extrasPrice: newExtrasPrice,
        totalPrice: newTotalPrice,
        hasBreakfast: hasIt,
      },
      formData
    );
  }

  return (
    <div>
      <h2 className="font-semibold text-2xl text-accent-400 mb-7">
        Edit Reservation #{reservationId}
      </h2>

      <form className="bg-primary-900 py-8 px-12 text-lg flex gap-6 flex-col" action={handleSubmit}>
        <div className="space-y-2">
          <input type="hidden" value={reservationId} name="reservationId" />
          <input type="hidden" value={guestId} name="guestId" />

          <label htmlFor="numGuests">How many guests?</label>
          <select
            name="numGuests"
            id="numGuests"
            defaultValue={numGuests}
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            required
          >
            <option value="" key="">
              Select number of guests...
            </option>
            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
              <option value={x} key={x}>
                {x} {x === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-5">
          <input
            name="hasBreakfast"
            id="hasBreakfast"
            className="w-6 h-6 accent-accent-500 mt-[-1px]"
            type="checkbox"
            defaultChecked={hasBreakfast}
          />
          <label htmlFor="hasBreakfast">Add breakfast</label>
        </div>

        <div className="space-y-2">
          <label htmlFor="observations">Anything we should know about your stay?</label>
          <textarea
            name="observations"
            defaultValue={observations}
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
          />
        </div>

        <div className="flex justify-end items-center gap-6">
          <SubmitButton pendingLabel="Updating...">Update reservation</SubmitButton>
        </div>
      </form>
    </div>
  );
}
