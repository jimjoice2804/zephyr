"use client";

import { AnimatePresence, motion } from "framer-motion";
// @ts-expect-error - no types available
import { Search, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { Input } from "../../shadui/input";

type HNSearchInputProps = {
	value: string;
	onChangeAction: (value: string) => void;
	placeholder?: string;
	className?: string;
};

const searchVariants = {
	initial: { scale: 0.95, opacity: 0 },
	animate: {
		scale: 1,
		opacity: 1,
		transition: {
			type: "spring",
			stiffness: 500,
			damping: 30,
		},
	},
	exit: { scale: 0.95, opacity: 0 },
};

export function HNSearchInput({
	value,
	onChangeAction,
	placeholder = "Search stories...",
	className,
}: HNSearchInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isFocused, setIsFocused] = useState(false);

	const handleClear = () => {
		onChangeAction("");
		inputRef.current?.focus();
	};

	return (
		<motion.div
			animate="animate"
			className={cn("relative", className)}
			exit="exit"
			initial="initial"
			variants={searchVariants}
		>
			<div className="relative flex items-center">
				<motion.div
					animate={{
						scale: isFocused ? 1.1 : 1,
						color: isFocused ? "var(--orange-500)" : "var(--muted-foreground)",
					}}
					className="pointer-events-none absolute left-3"
				>
					<Search className="h-4 w-4" />
				</motion.div>

				<Input
					className={cn(
						"w-full rounded-full",
						"pr-8 pl-9",
						"h-10",
						"bg-background/50 backdrop-blur-sm",
						"border-muted-foreground/20",
						"placeholder:text-muted-foreground/50",
						"focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
						"transition-all duration-200",
					)}
					onBlur={() => setIsFocused(false)}
					onChange={(e) => onChangeAction(e.target.value)}
					onFocus={() => setIsFocused(true)}
					placeholder={placeholder}
					ref={inputRef}
					type="text"
					value={value}
				/>

				<AnimatePresence>
					{value && (
						<motion.button
							animate={{ opacity: 1, scale: 1 }}
							className="absolute right-3 text-muted-foreground transition-colors hover:text-foreground"
							exit={{ opacity: 0, scale: 0 }}
							initial={{ opacity: 0, scale: 0 }}
							onClick={handleClear}
							type="button"
						>
							<X className="h-4 w-4" />
						</motion.button>
					)}
				</AnimatePresence>
			</div>

			<motion.div
				animate={{ opacity: isFocused ? 1 : 0 }}
				className="-z-10 absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100"
				initial={false}
			/>
		</motion.div>
	);
}
