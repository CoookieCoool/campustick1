export default function LoadingSpinner() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.spinner} />
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", justifyContent: "center", alignItems: "center", padding: "3rem" },
  spinner: {
    width: "40px", height: "40px",
    border: "4px solid #ddd",
    borderTop: "4px solid #e94560",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

// Inject keyframes once
const styleTag = document.createElement("style");
styleTag.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleTag);
