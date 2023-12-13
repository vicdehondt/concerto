import styles from "@/styles/Searchbar.module.css";

type SearchBarProps = {
  type: "long" | "thick" | "thin";
  onChange: (query: string) => void
};

function Searchbar({ type, onChange }: SearchBarProps) {
  return (
    <div
      className={[
        styles.search,
        type == "long" ? styles.longSearch : "",
        type == "thick" ? styles.thickBorderSearch : "",
        type == "thin" ? styles.thinBorderSearch : "",
      ].join(" ")}
    >
      <div
        className={[
          styles.searchContainer,
          type == "long" ? styles.longSearchContainer : "",
          type == "thick" ? styles.thickBorderSearchContainer : "",
          type == "thin" ? styles.thinBorderSearchContainer : "",
        ].join(" ")}
      >
        <div
          className={[
            styles.searchBar,
            type == "long" ? styles.longSearchBar : "",
            type == "thick" ? styles.thickBorderSearchBar : "",
            type == "thin" ? styles.thinBorderSearchBar : "",
          ].join(" ")}
        >
          <input type="text" placeholder="Search..." onChange={(event) => onChange(event.target.value)} />
        </div>
      </div>
    </div>
  );
}

export default Searchbar;
