import "./style.css"
import send from "./send.png"
import { useContext, useEffect, useState } from 'react';
import userContext from "../../context/user/userContext"
import Content from "./Content"

export default function Modal({ show, onClose, children, centered = false, username = null }) {
  const host = "http://localhost:5000/api/text"
  const context = useContext(userContext);
  const { user, fetchUsers } = context;

  const [Selected, setSelected] = useState(null);
  const [FetchAgain, setFetchAgain] = useState(false);
  const [Text, setText] = useState();

  useEffect(() => {
    fetchUsers();
    if (centered == true) {
      setSelected(username)
    }

  }, [])


  const Submit = async () => {
    if (!Selected || !Text) return;
    await fetch(host, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Sender: localStorage.getItem("username"),
        Reciver: Selected,
        Content: Text
      }),
    });
    setText("")
    setFetchAgain(true)
  }

  const onChange = (e) => {
    setText(e.target.value);
  };

  if (!show) return null;

  return (
    <div>
      <div className={`chat-modal-backdrop ${centered ? 'centered' : 'left-positioned'}`}>
        <div className={`chat-modal-content`}>

          {!centered &&
            <div className="user-scroll-container">
              {user
                .filter((u) => u.username !== localStorage.getItem("username"))
                .map((u, i) => (
                  <img
                    key={i}
                    src={`http://localhost:5000/api/fetchPfp?username=${u.username}`}
                    alt="profile"
                    className="user-avatar"
                    onClick={() => { setSelected(u.username); console.log(u.username) }}
                  />
                ))}
            </div>
          }


          {Selected && (
            <Content
              username={Selected}
              FetchAgain={FetchAgain}
              setFetchAgain={setFetchAgain}
            />
          )}

          {children}
          <div className="input">
            <form style={{width:"100%", display: "flex", alignItems: "center"}}  onClick={(e)=>{e.preventDefault()}}>
              <input className="input-area"
                type="text" placeholder="  enter your message" value={Text} onChange={onChange}></input>

              <button onClick={Submit} type="submit" className="btn btn-primary" style={{ marginLeft: "6px" }}><img src={send} height="20px" width="20px" style={{ filter: "invert(1)", marginBottom: "5px", }} /></button>
            </form>
            <button onClick={onClose} className="close-btn">X</button>
          </div>
        </div>


      </div>
    </div>
  )
}
