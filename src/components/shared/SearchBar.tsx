import '../../styles/components/searchBar.css'

export default function SearchBar() {
  return (
    <label className="search" aria-label="Search">
      <input type="text" placeholder="Tìm kiếm ..." className="search__input" />
      <span className="search__icon">Tìm kiếm</span>
    </label>
  )
}
