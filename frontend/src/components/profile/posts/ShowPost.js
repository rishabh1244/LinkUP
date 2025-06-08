import React, { useEffect, useRef, useState } from 'react';
import heart from './heart.png';
import likedIcon from './liked.png';
import cmnt from './comment.png';
import deleteIcon from './delete.png';
import send from "./send.png";

import DeleteModal from './DeleteModal';

export default function ShowPost({ show, onClose, post }) {
    const modalRef = useRef(null);

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [likeActive, setLikeActive] = useState(false);
    const [likeHover, setLikeHover] = useState(false);

    const [delActive, setDelActive] = useState(false);
    const [delHover, setDelHover] = useState(false);

    const [showDelModal, setShowDelModal] = useState(false);

    // Comment states
    const [Comments, setComments] = useState([]);
    const [Text, setText] = useState("");

    const baseFilter = "invert(1) brightness(2)";
    const hoverFilter = "invert(0.1) brightness(1.5)";
    const activeFilter = "invert(0.5) brightness(1.8)";

    // Time ago function from CommentModal
    function timeAgo(date) {
        const now = new Date();
        const past = new Date(date);
        const diff = Math.floor((now - past) / 1000); // difference in seconds

        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)} min(s)`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hr(s)`;
        return `${Math.floor(diff / 86400)} day(s)`;
    }

    // Comment functions from CommentModal
    const fetchComments = async () => {
        if (!post) return;
        
        const response = await fetch("http://localhost:5000/api/fetchComment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                postName: post.post_name,
            }),
        });
        const json = await response.json();
        setComments(json);
    };

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
        fetchComments();
    };

    const addComment = async (e) => {
        e.preventDefault();
        if (!Text.trim() || !post) return;
        
        const response = await fetch("http://localhost:5000/api/addComment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                postName: post.post_name,
                CommentAuthor: localStorage.getItem("username"),
                Comment: Text
            }),
        });
        fetchComments();
        setText("");
    };

    const onChange = (e) => {
        setText(e.target.value);
    };

    // Escape key to close
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (show) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [show, onClose]);

    // Fetch like state and comments from backend
    useEffect(() => {
        if (!post) return;
        setLikeCount(post.LikeCount);

        const getLikedInfo = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/postInt/isLiked", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        postAuthor: post.author,
                        LikedBy: localStorage.getItem("username"),
                        postName: post.post_name,
                    }),
                });
                const result = await response.json();
                setLiked(result.liked);
            } catch (err) {
                console.error("Error fetching like status:", err);
            }
        };

        getLikedInfo();
        fetchComments(); // Fetch comments when post loads
    }, [post]);

    // Reset comments when modal closes
    useEffect(() => {
        if (!show) {
            setComments([]);
            setText("");
        }
    }, [show]);

    const DelEvent = async () => {
        setDelActive(true);
        setTimeout(() => setDelActive(false), 150);

        setShowDelModal(true);

        const response = await fetch("http://localhost:5000/api/deletePost", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                DelBy: localStorage.getItem("username"),
                postAuthor: post.author,
                postName: post.post_name
            }),
        });
        const json = await response.json();
        //console.log(json);
    };

    const handleDelete = async () => {
        //console.log("deleted");
        //console.log(post.post_name);
        //console.log(localStorage.getItem("username"));
    };

    const handleLikeClick = async () => {
        if (!post) return;

        setLikeActive(true);
        setTimeout(() => setLikeActive(false), 150);

        try {
            const response = await fetch("http://localhost:5000/api/postInt/Like", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    postAuthor: post.author,
                    LikedBy: localStorage.getItem("username"),
                    postName: post.post_name,
                }),
            });
            await response.json();

            setLiked(!liked);
            setLikeCount((prev) => liked ? prev - 1 : prev + 1);
        } catch (err) {
            console.error("Error toggling like:", err);
        }
    };

    if (!show || !post) return null;

    return (
        <div style={styles.overlay}>
            <div ref={modalRef} style={styles.modal}>
                <div style={styles.imageSection}>
                    <img
                        src={`http://localhost:5000/api/fetchPostFile/${post.author}/${post.post_name}`}
                        alt="Post"
                        style={styles.postImage}
                    />
                    <button onClick={onClose} style={styles.closeButton}>×</button>
                </div>

                <div style={styles.infoSection}>
                    <div style={styles.userInfo}>
                        <img
                            src={`http://localhost:5000/api/fetchPfp?username=${post.author}`}
                            style={{ borderRadius: '100%', height: '40px', marginRight: '8px' }}
                            alt="user"
                        />
                        <strong style={styles.username}>@{post.author}</strong>
                        <p style={styles.description}>{post.post_description}</p>
                    </div>

                    <div style={styles.commentsSection}>
                        <h5 style={styles.commentsTitle}>Comments</h5>
                        <div style={styles.commentsList}>
                            {Comments.length === 0 ? (
                                <p style={styles.commentsPlaceholder}>No comments yet...</p>
                            ) : (
                                Comments.map((comment, idx) => (
                                    <div key={comment._id || idx} style={styles.commentItem}>
                                        <img 
                                            src={`http://localhost:5000/api/fetchPfp?username=${comment.CommentAuthor}`} 
                                            style={styles.commentAvatar}
                                            alt="user"
                                        />
                                        <div style={styles.commentContent}>
                                            <div style={styles.commentHeader}>
                                                <strong style={styles.commentAuthor}>{comment.CommentAuthor}</strong>
                                                <span style={styles.commentTime}>{timeAgo(comment.date)}</span>
                                            </div>
                                            <p style={styles.commentText}>{comment.Comment}</p>
                                        </div>
                                        {(localStorage.getItem("username") === comment.CommentAuthor) && (
                                            <button
                                                onClick={(e) => { deleteComment(e, comment.postName, comment.CommentAuthor, comment.Comment) }}
                                                style={styles.deleteCommentBtn}
                                            >
                                                <img
                                                    src={deleteIcon}
                                                    alt="delete"
                                                    style={styles.deleteCommentIcon}
                                                />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div style={styles.iconBar}>
                        <button
                            onMouseEnter={() => setLikeHover(true)}
                            onMouseLeave={() => setLikeHover(false)}
                            onClick={handleLikeClick}
                            style={{ background: "none", border: "none", cursor: "pointer" }}
                        >
                            <img
                                src={liked ? likedIcon : heart}
                                alt="like"
                                style={{
                                    ...styles.icon,
                                    filter: likeActive ? activeFilter : likeHover ? hoverFilter : baseFilter,
                                    transform: likeActive ? "scale(1.1)" : "scale(1)",
                                    transition: "filter 0.15s ease, transform 0.15s ease"
                                }}
                            />
                        </button>
                        <p style={{ color: "white" }}>{likeCount}</p>


                        {post.author === localStorage.getItem("username") && (
                            <button
                                onMouseEnter={() => setDelHover(true)}
                                onMouseLeave={() => setDelHover(false)}
                                onClick={DelEvent}
                                style={{ display: "flex", marginLeft: "auto", background: "none", border: "none", cursor: "pointer" }}
                            >
                                <img
                                    src={deleteIcon}
                                    alt="delete"
                                    style={{
                                        ...styles.icon,
                                        filter: delActive ? activeFilter : delHover ? hoverFilter : baseFilter,
                                        transform: delActive ? "scale(1.1)" : "scale(1)",
                                        transition: "filter 0.15s ease, transform 0.15s ease"
                                    }}
                                />
                            </button>
                        )}
                    </div>

                    {/* Comment input form */}
                    <form style={styles.commentForm} onSubmit={(e) => addComment(e)}>
                        <input 
                            style={styles.commentInput}
                            onChange={onChange} 
                            value={Text} 
                            placeholder="Write a comment !" 
                        />
                        <button type="submit" style={styles.sendButton}>
                            <img src={send} style={styles.sendIcon} alt="send" />
                        </button>
                    </form>

                    <DeleteModal
                        show={showDelModal}
                        onClose={() => setShowDelModal(false)}
                        onConfirm={async () => {
                            await handleDelete();
                            setShowDelModal(false);
                            onClose();
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        display: 'flex',
        maxWidth: '90vw',
        maxHeight: '90vh',
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    imageSection: {
        position: 'relative',
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    postImage: {
        maxWidth: '100%',
        maxHeight: '90vh',
        objectFit: 'contain',
    },
    closeButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.5)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        fontSize: '20px',
        cursor: 'pointer',
    },
    infoSection: {
        width: '400px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1a1a1a',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
    },
    username: {
        color: 'white',
        fontSize: '16px',
        marginRight: '10px',
    },
    description: {
        color: '#ccc',
        fontSize: '14px',
        margin: '5px 0 0 0',
        width: '100%',
    },
    commentsSection: {
        height: '70%',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
    },
    commentsTitle: {
        color: 'white',
        fontSize: '18px',
        marginBottom: '15px',
        borderBottom: '1px solid #333',
        paddingBottom: '10px',
    },
    commentsList: {
        flex: 1,
        overflowY: 'auto',
        minHeight: '250px',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // Internet Explorer 10+
        '&::-webkit-scrollbar': {
            display: 'none', // Chrome, Safari, Edge
        },
    },
    commentsPlaceholder: {
        color: '#666',
        fontSize: '14px',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: '20px',
    },
    commentItem: {
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: '15px',
        padding: '10px',
        backgroundColor: '#2a2a2a',
        borderRadius: '8px',
    },
    commentAvatar: {
        borderRadius: '100%',
        height: '30px',
        width: '30px',
        marginRight: '10px',
        flexShrink: 0,
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '5px',
    },
    commentAuthor: {
        color: 'white',
        fontSize: '14px',
        marginRight: '10px',
    },
    commentTime: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '12px',
    },
    commentText: {
        color: '#ccc',
        fontSize: '14px',
        margin: 0,
        wordWrap: 'break-word',
    },
    deleteCommentBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '5px',
        marginLeft: '10px',
    },
    deleteCommentIcon: {
        width: '16px',
        height: '16px',
        filter: 'invert(1) brightness(0.7)',
    },
    iconBar: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
        paddingTop: '15px',
        borderTop: '1px solid #333',
    },
    icon: {
        width: '24px',
        height: '24px',
        cursor: 'pointer',
    },
    commentForm: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    },
    commentInput: {
        flex: 1,
        padding: '10px',
        borderRadius: '20px',
        border: '1px solid #333',
        backgroundColor: '#2a2a2a',
        color: 'white',
        fontSize: '14px',
        outline: 'none',
    },
    sendButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '5px',
    },
    sendIcon: {
        width: '20px',
        height: '20px',
        marginTop: '-2px',
    },
};
// const styles = {
//     overlay: {
//         position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
//         backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
//         justifyContent: 'center', alignItems: 'center', zIndex: 1000,
//     },
//     modal: {
//         background: '#282c34', color: '#f0f0f0', display: 'flex',
//         borderRadius: '10px', overflow: 'hidden', width: '90%', height: '80%',
//         position: 'relative',
//     },
//     imageSection: {
//         flex: 2, position: 'relative',
//     },
//     postImage: {
//         width: '100%', height: '100%', objectFit: 'contain',
//         backgroundColor: 'rgba(0,0,0,0.1)'
//     },
//     closeButton: {
//         position: 'absolute', top: '10px', right: '10px',
//         background: 'transparent', border: 'none', fontSize: '2rem',
//         color: '#fff', cursor: 'pointer',
//     },
//     infoSection: {
//         flex: 1, padding: '20px', display: 'flex',
//         flexDirection: 'column', justifyContent: 'space-between',
//         backgroundColor: '#282c34',
//     },
//     userInfo: {
//         marginBottom: '10px',
//     },
//     username: {
//         color: '#61dafb',
//         fontSize: '1.1rem',
//     },
//     description: {
//         color: '#ccc',
//         marginTop: '5px',
//     },
//     iconBar: {
//         display: 'flex', gap: '15px', alignItems: 'center',
//     },
//     icon: {
//         width: '24px', height: '24px', cursor: 'pointer',
//     },
//     commentsSection: {
//         marginTop: '20px', flexGrow: 1, overflowY: 'auto',
//     },
//     commentsTitle: {
//         marginBottom: '10px',
//         color: '#f0f0f0',
//     },
//     commentsPlaceholder: {
//         fontStyle: 'italic',
//         color: '#999',
//     },
// };
