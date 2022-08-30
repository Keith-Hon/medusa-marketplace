import Footer from "@modules/layout/templates/footer";
import Nav from "@modules/layout/templates/nav";
import React from "react";

const Layout: React.FC<any> = ({ children }: { children?: React.ReactNode }) => {
    return (
        <div>
            <Nav />
            <main className="relative">{children}</main>
            <Footer />
        </div>
    );
};

export default Layout;
