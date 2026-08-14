import { createUseStyles } from "react-jss";
import Link from "../../link";

const useStyles = createUseStyles({
  container: {
    margin: 0,
    padding: 0,
    height: "40px",
    display: "flex",
    alignItems: "center",
  },
  col: {
    padding: 0,
    margin: 0,
    width: "auto",
    flex: "0 0 auto",
  },
  row: {
    margin: 0,
    padding: 0,
    display: "flex",
    flexWrap: "nowrap",
    alignItems: "center",
    height: "40px",
  },
  linkContainer: {
    display: "flex",
    margin: 0,
    padding: 0,
    height: "40px",
    alignItems: "center",
  },
  linkEntry: {
    color: "#393b3d!important",
    fontWeight: 500,
    fontSize: "16px",
    textDecoration: "none!important",
    height: "40px",
    padding: "9px 18px!important",
    whiteSpace: "nowrap",
    borderBottom: "2px solid transparent",
    "&:hover": {
      color: "#393b3d!important",
      background: "transparent!important",
      borderBottom: "2px solid #393b3d",
      borderRadius: "0!important",
    },
    "@media(max-width: 1100px)": {
      padding: "9px 10px!important",
    },
    "@media(max-width: 991px)": {
      fontSize: "14px",
      padding: "9px 7px!important",
    },
  },
});

const LinkEntry = props => {
  const s = useStyles();
  return <div className={s.linkContainer}>
    <Link href={props.url}>
      <a className={`${s.linkEntry} nav-link`}>
        {props.children}
      </a>
    </Link>
  </div>
}

const NavigationLinks = () => {
  const s = useStyles();

  return <div className={s.col}>
    <div className={s.container}>
      <div className={s.row}>
        <LinkEntry url="/games">Discover</LinkEntry>
        <LinkEntry url="/catalog">Avatar Shop</LinkEntry>
        <LinkEntry url="/develop">Create</LinkEntry>
        <LinkEntry url="/My/Money.aspx">Robux</LinkEntry>
      </div>
    </div>
  </div>
}

export default NavigationLinks;
