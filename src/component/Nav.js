import React from "react";
import {Link} from "react-router-dom";

function Nav() {

    const navStyle = {
        color: 'white'
    };

    return (
        <div>
            <nav>
                <div className="nav-logo">Textkernel</div>

                <ul className="nav-links">
                    <Link style={navStyle} to="/basicView">
                        <li>Basic View</li>
                    </Link>
                </ul>
             </nav>
        </div>
    )
}

export default Nav;
