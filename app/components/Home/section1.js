"use client"
import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";

const links = [
    { text: "Home", href: "#home" },
    { text: "About", href: "#about" }
]

export default function Section1() {
    const [scrolled, setScrolled] = useState(false);

    // Effect to add/remove scroll event listener
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        // Add event listener
        window.addEventListener('scroll', handleScroll);

        // Remove event listener on cleanup
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    return (
        <>
            <div className={`fixed z-10 flex gap-5 ml-10 mt-5 ${scrolled ? 'bg-black' : ''}`}>
                {links.map((link, index) => (
                    <Link key={index} href={link.href}>
                        <div className="text-white text-xl hover:underline decoration-white decoration-4 underline-offset-8">
                            {link.text}
                        </div>
                    </Link>
                ))}
            </div>
            <div className={`fixed z-10 flex gap-5 text-white text-xl mt-5 right-7 ${scrolled ? 'bg-black' : ''}`}>
                <div>
                    <Link href="/login" className="hover:underline decoration-white decoration-4 underline-offset-8">
                        Login
                    </Link>
                </div>
                <div>
                    <Link href="/signup" className="hover:underline decoration-white decoration-4 underline-offset-8">
                        Signup
                    </Link>
                </div>
            </div>

            <div
                id="home"
                className="relative h-screen w-screen bg-opacity-0 home"
            >
                {/* <button onClick={logout}>LOGOUT</button> */}/
                <Image
                    src="/Images/homeBackground2.png"
                    fill={true}
                    quality={100}
                    style={{
                        opacity: 0.9
                    }}
                    priority
                />
                <div
                    className="absolute w-full top-[45%] -translate-y-1/2 text-center"
                >
                    <h1>
                        <span className="block text-6xl text-white bg-clip-text text-transparent">
                            
                        </span>
                    </h1>
                    <br />
                    <h2 className="text-2xl text-white">
                        
                    </h2>
                </div>
                <Link href="/services">
                    {/* <button className="absolute z-10 text-white text-xl bg-black rounded-[20px] -translate-y-1/2 -translate-x-1/2 text-center top-2/3 left-1/2 p-3"
                        style={{
                            opacity: 0.8
                        }}
                    >
                        
                    </button> */}
                </Link>
            </div>
        </>
    )
}