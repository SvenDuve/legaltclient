// NavigationBar.js
import { Link } from 'react-router-dom';


const NavigationBar = ({ page, pagename }) => {
    return (
        <nav>
            {/* Other navigation links */}
            <Link to={ page }> { pagename } </Link>
        </nav>
    );
}


export default NavigationBar;