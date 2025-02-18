// components/TopNavBar.js
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

const TopNavBar = () => {
    return (
        <AppBar id={"main-app-bar"} position="fixed">

            <Typography variant={"h1"} gutterBottom id={"title"} align={"center"}>
                Object Library
            </Typography>

            <Toolbar id={"nav-toolbar"}>
                <Button color="inherit">
                    <Link href="/" passHref>
                        Home
                    </Link>
                </Button>
                <Button color="inherit">
                    <Link href="/upload" passHref>
                        Upload
                    </Link>
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default TopNavBar;
