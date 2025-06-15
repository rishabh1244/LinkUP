import { useEffect, useState } from "react"
import { Link } from 'react-router-dom'
import "./text.css"

export default function Content(props) {
    const host = "http://localhost:5000/api/getText"
    const [chats, setChats] = useState([]);

    const fetchChats = async () => {
        const response = await fetch(host, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user1: localStorage.getItem("username"),
                user2: props.username,
            }),
        });

        const json = await response.json();
        setChats(json);
    };
    function timeAgo(date) {
        const now = new Date();
        const past = new Date(date);
        const diff = Math.floor((now - past) / 1000); // difference in seconds

        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hr`;
        return `${Math.floor(diff / 86400)} day`;
    }
    useEffect(() => {
        fetchChats();
    }, [props.username]);

    useEffect(() => {
        fetchChats();
        const interval = setInterval(fetchChats, 300); // every 3 seconds

        return () => clearInterval(interval); // cleanup on unmount
    }, [props.username]);

    return (
        <>
                    <div className="messages">
            {(
                <div class="userInfo">
                    <img
                        src={`http://localhost:5000/api/fetchPfp?username=${props.username}`}
                        alt="profile"
                        className="user-avatar"
                        style={{ height: "70px", width: "70px" }}
                    />
                    <h2> {props.username}</h2>
                    <Link to="/profile" state={{ username: props.username }}>
                        <button type="button" className="btn btn-dark">
                            View Profile
                        </button>
                    </Link>

                </div>
            )}
                {(chats.map((c, i) => {
                    const isSender = c.Sender === localStorage.getItem("username");
                    return (
                        <div key={i} className={`text-box ${isSender ? 'left' : 'right'}`}>
                            <p>{c.Content}</p>
                            {/* style={{ marginLeft: "80%", color: "rgba(255, 255, 255, 0.3)" }} */}
                            <p className={`${isSender ? 'TimeLeft' : 'TimeRight'}`}>{timeAgo(c.date)}</p>
                        </div>
                    );
                }))}
            </div>
        </>
    );
}