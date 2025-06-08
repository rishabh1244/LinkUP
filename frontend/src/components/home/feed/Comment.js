
import { useRef, useState, useEffect } from 'react';

import './comments.css';
import send from "./send.png"
import deleteIcon from "./delete.png"

export default function CommentModal({ show, onClose, postName }) {
  const [Comments, setComments] = useState([]);
  const [Text, setText] = useState("")

  const modalRef = useRef();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [show, onClose]);


  function timeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now - past) / 1000); // difference in seconds

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min(s)`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr(s)`;
    return `${Math.floor(diff / 86400)} day(s)`;
  }


  const fetchComments = async () => {
    const response = await fetch("http://localhost:5000/api/fetchComment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postName: postName,
      }),
    });
    const json = await response.json()
    setComments(json)

  }
  const deleteComment = async (e, postname, author, comment) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/api/deleteComment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postName: postname,
        CommentAuthor: author,
        Comment: comment
      }),
    });
    fetchComments()
  }

  const addComment = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/api/addComment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postName: postName,
        CommentAuthor: localStorage.getItem("username"),
        Comment: Text
      }),
    });
    // const json = await response;
    fetchComments()
    setText("");

  }
  const onChange = (e) => {
    setText(e.target.value);
  };

  useEffect(() => {
    if (show && postName) {
      fetchComments();
    } else {
      setComments([]);
    }


  }, [show, postName]);

  if (!show) return null;

  return (
    <div className="comment-overlay">



      <div className="comment-modal" ref={modalRef}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h3 className="comment-title">Comments</h3>

        <div className="comment-list">
          {Comments.map((comment, idx) => (
            <div key={comment._id || idx} className="comment-item">
              <img src={`http://localhost:5000/api/fetchPfp?username=${comment.CommentAuthor}`} style={{
                borderRadius: '100%',
                height: '20px',
                width: 'auto',
                marginRight: '10px'
              }} />
              <strong>{comment.CommentAuthor}</strong> {comment.Comment}
              <p style={{ color: "rgb(255, 255, 255,0.3)" }}>{timeAgo(comment.date)}</p>

              {(localStorage.getItem("username") === comment.CommentAuthor) &&
                <button
                  onClick={ (e)=>{ deleteComment (e,comment.postName, comment.CommentAuthor,comment.Comment)}}
                  style={{ display: "flex", marginLeft: "auto", background: "none", border: "none", cursor: "pointer" }}
                >
                  <img
                    src={deleteIcon}
                    alt="like"
                    style={{
                      ...styles.icon,
                    }}
                  />
                </button>
              }
            </div>
          ))}
        </div>

        <form className="comment-form" onSubmit={(e) => addComment(e)}>
          <input className="form-control" onChange={onChange} value={Text} placeholder="Write a comment !" />
          <button type="submit" className="btn btn-primary"><img src={send} style={{ marginTop: "-5px" }} height='20vh' width='20vh' ></img></button>
        </form>

      </div>


    </div>
  );
}

const styles = {
  icon: {
    width: '24px', height: '24px', cursor: 'pointer',
  },
}