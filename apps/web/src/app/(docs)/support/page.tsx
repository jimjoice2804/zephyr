// @ts-expect-error - image does not have types
import DGIMAGE from "@assets/auth/signup-image.jpg";
import type { Metadata } from "next";
import Image from "next/image";
import SupportForm from "./support-form";

export const metadata: Metadata = {
	title: "Support",
	description:
		"Get help, report bugs, or share your suggestions with the Zephyr team",
};

export default function SupportPage() {
	return (
		<div className="relative min-h-screen overflow-hidden">
			<div className="-z-10 fixed inset-0">
				<Image
					alt="Background"
					className="object-cover object-center"
					fill
					priority
					src={DGIMAGE}
				/>
				<div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
			</div>

			<div className="container relative mx-auto px-4 py-16">
				<div className="mx-auto max-w-2xl text-center">
					<h1 className="relative mb-4 bg-gradient-to-r from-primary/50 to-primary bg-clip-text font-bold text-4xl text-transparent tracking-tight sm:text-5xl">
						How can we help?
					</h1>
					<p className="text-lg text-muted-foreground leading-8">
						We're here to help! Send us your questions, suggestions, or report
						any issues you've encountered.
					</p>
				</div>
				<SupportForm />
			</div>
		</div>
	);
}
