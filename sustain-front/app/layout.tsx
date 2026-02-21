import type { Metadata } from "next";
import { Abhaya_Libre, Ribeye_Marrow, Bebas_Neue } from "next/font/google";
import "./globals.css";

import "mapbox-gl/dist/mapbox-gl.css";

const abhayaLibre = Abhaya_Libre({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
    variable: "--font-abhaya",
});

const ribeyeMarrow = Ribeye_Marrow({
    subsets: ["latin"],
    weight: "400",
    display: "swap",
    variable: "--font-ribeye",
});

const bebasNeue = Bebas_Neue({
    subsets: ["latin"],
    weight: "400",
    display: "swap",
    variable: "--font-bebas",
});

export const metadata: Metadata = {
    title: "sustAIn — Balancing Grid and Green",
    description: "Where renewable potential, infrastructure, and connectivity quietly align.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${abhayaLibre.variable} ${ribeyeMarrow.variable} ${bebasNeue.variable}`}>
            <body className={abhayaLibre.className} style={{ margin: 0, background: "#F6F4FB" }}>
                {children}
            </body>
        </html>
    );
}
