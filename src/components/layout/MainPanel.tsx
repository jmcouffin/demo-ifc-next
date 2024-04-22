import { memo, useEffect, useState } from "react";
import { IconButton, useMediaQuery } from "@chakra-ui/react";
import { twMerge } from "tailwind-merge";
import { SidePanelHeader } from "@/components/layout/SidePanelHeader";
import { SidePanelStoreyList } from "@/components/storeys/SidePanelStoreyList";
import { Logo } from "@/components/common/Logo";
import { MobileMainNav } from "./MobileMainNav";
import { ActiveNavItemId } from "@/core/type";
import { RiExpandRightLine } from "react-icons/ri";

const BREAKPOINT_XL = "80em";

export const MainPanel = memo(
    ({
        isExpanded,
        onExpand,
        onCollapse,
        isUnderAnotherMobilepanel,
    }: {
        isExpanded: boolean;
        onExpand: () => void;
        onCollapse: () => void;
        isUnderAnotherMobilepanel: boolean;
    }) => {
        const [activeNavItemId, setActiveNavItemId] = useState<ActiveNavItemId>(null);
        const [isUnderAnotherPanel, setIsUnderAnotherPanel] = useState(false);

        const [isSmallerThanXL] = useMediaQuery(`(max-width: ${BREAKPOINT_XL})`);
        useEffect(() => {
            if (isSmallerThanXL) {
                setIsUnderAnotherPanel(isUnderAnotherMobilepanel);
            }
        }, [isSmallerThanXL, isUnderAnotherMobilepanel]);

        const isCollapsed = !isExpanded;

        return (
            <>
                <aside
                    className={twMerge(
                        `
                            side-panel
                            fixed xl:absolute
                            xl:top-0 bottom-0 left-0 w-screen max-h-[50vh] xl:w-[var(--side-panel-width)] xl:h-[100dvh] xl:max-h-none
                            rounded-xl xl:rounded-none
                            bg-blur transition-all
                        `,
                        isCollapsed ? "xl:w-16" : "",
                    )}
                    style={{
                        translate: isUnderAnotherPanel ? "0 10vh" : "0 0",
                        opacity: isUnderAnotherPanel ? ".2" : "1",
                    }}
                >
                    {isCollapsed && <CollapsedSidePanel onExpand={onExpand} />}

                    <div
                        className={twMerge(
                            "flex flex-col h-[inherit]",
                            isCollapsed ? "animate-disappear-left" : "animate-appear-right",
                        )}
                    >
                        <SidePanelHeader onCollapse={onCollapse} />
                        <div className="overflow-y-scroll">
                            <SidePanelStoreyList />
                        </div>
                    </div>
                </aside>
                <MobileMainNav activeNavItemId={activeNavItemId} setActiveNavItemId={setActiveNavItemId} />
            </>
        );
    },
);

MainPanel.displayName = "SidePanel";

const CollapsedSidePanel = ({ onExpand }: { onExpand: () => void }) => (
    <div className="absolute top-2 left-2 flex flex-col items-center animate-appear-left z-10">
        <Logo className="-mt-px" />
        <IconButton
            aria-label="Expand side panel"
            size="sm"
            variant="ghost"
            color="content.tertiary"
            rounded="full"
            icon={<RiExpandRightLine />}
            rotate={90}
            onClick={onExpand}
        />
    </div>
);
