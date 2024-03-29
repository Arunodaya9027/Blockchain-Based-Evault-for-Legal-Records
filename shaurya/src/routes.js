/*!

=========================================================
* Argon Dashboard React - v1.2.3
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Index from "views/Index.js";
import Profile from "views/examples/Profile.js";
// import Register from "views/examples/Register.js";
import Login from "views/examples/Login.js";
import Transaction from "views/examples/Transactions";
import Icons from "views/examples/Icons.js";
import Users from "views/examples/Users.js";
import Adduser from "views/examples/AddUser.js";
import Share from "views/examples/Share/Share.js";

var routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
    layout: "/admin",
  },
  // {
  //   path: "/tables",
  //   name: "Search User",
  //   icon: "ni ni-atom text-info",
  //   component: <Transaction />,
  //   layout: "/admin",
  // },
  {
  path: "/tables",
  name: "Today's Routine",
  icon: "ni ni-bullet-list-67 text-red",
  component: <Transaction />,
  layout: "/admin",
},
{
  path: "/contacts",
  name: "Contacts",
  icon: "ni ni-single-02 text-green",
  component: <Users/>,
  layout: "/admin",
},{
    path: "/icons",
    name: "My Docs",
    icon: "ni ni-single-copy-04 text-gray",
    component: <Icons />,
    layout: "/admin",
  },
  {
    path: "/tables",
    name: "My Transactions",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Transaction />,
    layout: "/admin",
  },
  {
    path: "/share",
    name: "Share",
    icon: "ni ni-send text-purple",
    component: <Share />,
    layout: "/admin",
  },
  // {
  //   path: "/login",
  //   name: "Login",
  //   icon: "ni ni-key-25 text-info",
  //   component: <Login />,
  //   layout: "/auth",
  // },
  // {
  //   path: "/register",
  //   name: "Register",
  //   icon: "ni ni-circle-08 text-pink",
  //   component: <Register />,
  //   layout: "/auth",
  // },

  {
    path: "/adduser",
    name: "Add User",
    icon: "ni ni-single-02 text-red ",
    component: <Adduser/>,
    layout: "/admin",
  },
  {
    path: "/tables",
    name: "Notice Corner",
    icon: "ni ni-notification-70 text-dark",
    component: <Transaction />,
    layout: "/admin",
  },
  {
    path: "/user-profile",
    name: "User Profile",
    icon: "ni ni-single-02 text-yellow",
    component: <Profile />,
    layout: "/admin",
  },{
    path: "/icons",
    name: "Access & Security",
    icon: "ni ni-settings-gear-65 text-gray",
    component: <Icons />,
    layout: "/admin",
  },{
    path: "/icons",
    name: "Settings",
    icon: "ni ni-settings text-gray",
    component: <Icons />,
    layout: "/admin",
  },{
    path: "/icons",
    name: "HelpDesk",
    icon: "ni ni-planet text-blue",
    component: <Icons />,
    layout: "/admin",
  },
  {
    path: "/login",
    name: "Log Out",
    icon: "ni ni-key-25 text-info",
    component: <Login />,
    layout: "/auth",
  },
];
export default routes;
