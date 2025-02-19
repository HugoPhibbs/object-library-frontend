"use client"

import Link from 'next/link';
import {AppBar, Toolbar, Typography, Button} from '@mui/material';
import {usePathname} from "next/navigation";

function ToolBarLinkButton({href, label}: { href: string, label: string }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Button sx={{ border: isActive ? "2.5px solid #c4c4c4" : null }} className={"nav-button"}>
            <Link href={href} passHref>
                {label}
            </Link>
        </Button>
    )
}

const TopNavBar = () => {
    return (
        <AppBar id={"main-app-bar"} position="fixed">

            <Typography variant={"h1"} gutterBottom id={"title"} align={"center"}>
                Object Library
            </Typography>

            <Toolbar id={"nav-toolbar"}>
                <ToolBarLinkButton href={"/"} label={"Home"}/>
                <ToolBarLinkButton href={"/upload"} label={"Upload"}/>
            </Toolbar>
        </AppBar>
    );
};

export default TopNavBar;
