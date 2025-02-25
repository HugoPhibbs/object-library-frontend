"use client"

import Link from 'next/link';
import {AppBar, Toolbar, Typography, Button, Divider} from '@mui/material';
import {usePathname} from "next/navigation";

import Image from "next/image"

function ToolBarLinkButton({href, label}: { href: string, label: string }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Button sx={{ borderBottom: isActive ? "2px solid var(--blue)" : null }} className={"nav-button"} disableRipple>
            <Link href={href} passHref className={"nav-link"} style={{fontWeight: isActive ? "bold": "normal"}}>
                {label}
            </Link>
        </Button>
    )
}

const TopNavBar = () => {
    return (
        <AppBar id={"main-app-bar"} position="fixed">

            <Typography variant={"h1"} gutterBottom id={"title"} align={"center"}>
                <Image src="/ngakopa_icon.png" alt={"icon"} width={160} height={30}></Image>
                Object Library
            </Typography>

            <Toolbar id={"nav-toolbar"}>
                <ToolBarLinkButton href={"/"} label={"Home"}/>

                <Divider orientation={"vertical"} variant={"middle"} flexItem className={"nav-divider"} />

                <ToolBarLinkButton href={"/upload"} label={"Upload"}/>

                <Divider orientation={"vertical"} variant={"middle"} flexItem className={"nav-divider"} />

                <ToolBarLinkButton href={"/connections"} label={"Connections"}/>
            </Toolbar>
        </AppBar>
    );
};

export default TopNavBar;
