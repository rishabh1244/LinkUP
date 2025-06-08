import { useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar"
import Feed from './feed/Feed';
import UsersList from './users/UsersList';
import Chat from '../chat/Chat';

export default function Home() {
  let navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token") === null) {
      navigate("/auth");
    }
  }, []);

  const logout = () => {
    //console.log(localStorage.getItem("token"))
    localStorage.removeItem("token");
    //console.log(localStorage.getItem("token"))
    navigate("/auth");
  }

  return (

    <div>
      <Navbar username={localStorage.getItem("username")} logout={logout} />


      <div style={{
        display: "flex",
        height: "100vh"
      }}>
        <Chat/>
        <Feed username={localStorage.getItem("username")} />
        <UsersList />
      </div>

    </div>
  )
}

