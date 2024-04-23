import { METADATA } from "@/lib/content/metadata";
import Logo from "public/logo/logo.svg";

export const AboutPanel = () => {
    return (
        <article className="flex flex-col items-center justify-center h-full">
            <div className="glow-effect before:w-[50%] text-center">
                <Logo className="w-20 aspect-square mx-auto" />
                <h1 className="text-xl font-semibold">{METADATA.title}</h1>
                <p className="mt-1 text-sm text-tertiary">
                    Example of a{" "}
                    <a className="link" target="_blank" href="https://3dverse.com/">
                        3dverse web app
                    </a>
                    .
                </p>
            </div>
        </article>
    );
};

AboutPanel.displayName = "AboutPanel";