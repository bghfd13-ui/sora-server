import { createUseStyles } from "react-jss";
import NavigationStore from "../../../stores/navigation";

const useLogoStyles = createUseStyles({
  col: {
    width: "116px",
    minWidth: "116px",
    height: "40px",
    padding: 0,
    margin: "0 8px 0 12px",
    display: "flex",
    alignItems: "center",
    "@media(max-width: 1324px)": {
      width: "48px",
      minWidth: "48px",
      margin: "0 4px",
    },
  },
  wordmark: {
    display: "block",
    color: "#393b3d!important",
    fontSize: "22px",
    lineHeight: "40px",
    fontWeight: 900,
    letterSpacing: "-1px",
    textDecoration: "none!important",
    transform: "skew(-4deg)",
    "@media(max-width: 1324px)": {
      fontSize: "0",
      width: "28px",
      height: "28px",
      marginLeft: "3px",
      border: "7px solid #393b3d",
      transform: "rotate(15deg)",
    },
  },
  openSideNavMobile: {
    display: "none",
    "@media(max-width: 1324px)": {
      display: "block",
      height: "30px",
      width: "30px",
      cursor: "pointer",
      marginRight: "2px",
    },
  },
});

const Logo = () => {
  const s = useLogoStyles();
  const navStore = NavigationStore.useContainer();

  return <div className={s.col}>
    <div className={`${s.openSideNavMobile} icon-menu`} onClick={() => {
      navStore.setIsSidebarOpen(!navStore.isSidebarOpen);
    }} />
    <a className={s.wordmark} href="/home">SORA</a>
  </div>
}

export default Logo;
