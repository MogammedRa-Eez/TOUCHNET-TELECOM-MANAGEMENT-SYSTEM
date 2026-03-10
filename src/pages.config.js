/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIAssistant from './pages/AIAssistant';
import Billing from './pages/Billing';
import CustomerPortal from './pages/CustomerPortal';
import CustomerProjectPortal from './pages/CustomerProjectPortal';
import CustomerSelfService from './pages/CustomerSelfService';
import Customers from './pages/Customers';
import Employees from './pages/Employees';
import FibreProjects from './pages/FibreProjects';
import HRDashboard from './pages/HRDashboard';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Network from './pages/Network';
import OutlookMail from './pages/OutlookMail';
import RolesManagement from './pages/RolesManagement';
import Tickets from './pages/Tickets';
import UserSettings from './pages/UserSettings';
import Dashboard from './pages/Dashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIAssistant": AIAssistant,
    "Billing": Billing,
    "CustomerPortal": CustomerPortal,
    "CustomerProjectPortal": CustomerProjectPortal,
    "CustomerSelfService": CustomerSelfService,
    "Customers": Customers,
    "Employees": Employees,
    "FibreProjects": FibreProjects,
    "HRDashboard": HRDashboard,
    "Home": Home,
    "Inventory": Inventory,
    "Network": Network,
    "OutlookMail": OutlookMail,
    "RolesManagement": RolesManagement,
    "Tickets": Tickets,
    "UserSettings": UserSettings,
    "Dashboard": Dashboard,
}

export const pagesConfig = {
    mainPage: "AIAssistant",
    Pages: PAGES,
    Layout: __Layout,
};