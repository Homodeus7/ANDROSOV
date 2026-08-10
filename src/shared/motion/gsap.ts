"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Flip } from "gsap/Flip";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, Flip, Observer, ScrollTrigger, SplitText);
}

export { gsap, useGSAP, Flip, Observer, ScrollTrigger, SplitText };
