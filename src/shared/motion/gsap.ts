"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, Observer, ScrollTrigger, SplitText);
}

export { gsap, useGSAP, Observer, ScrollTrigger, SplitText };
