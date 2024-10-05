import Header from "./_components/Header";
import "@/app/_styles/globals.css";
import { Josefin_Sans } from "next/font/google";
import { ReservationProvider } from "./_components/ReservationContext";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: { template: "%s | The Wild Oasis", default: "The Wild Oasis" },
};

const josefin = Josefin_Sans({ subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${josefin.className} bg-primary-950 min-h-screen text-primary-100 flex flex-col antialiased `}
      >
        <Header />

        <div className="flex-1 px-8 py-12 grid">
          <main className="mx-auto max-w-7xl w-full">
            <ReservationProvider>{children}</ReservationProvider>
            <Toaster
              position="center"
              toastOptions={{
                className: "bg-red-500",
                style: {
                  padding: "16px",
                  fontSize: "18px",
                  backgroundColor: "#D4DEE7",
                },
              }}
            />
          </main>
        </div>
      </body>
    </html>
  );
}
