"use client";
import Section1 from "./components/Home/section1";
import Section2 from "./components/Home/section2";

export default function Home() {
  return (
    <div className="bg-black overflow-hidden">
      <Section1 />
      <Section2 />
    </div>
  );
}
