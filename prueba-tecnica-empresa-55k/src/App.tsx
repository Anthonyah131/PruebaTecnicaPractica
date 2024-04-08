import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { SortBy, type User } from "./types.d";
import { UserList } from "./components/UserList";

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [showColors, setShowColors] = useState(false);
  const [sorting, setSorting] = useState<SortBy>(SortBy.NONE);
  const [filterCountry, setFilterCountry] = useState<string | null>(null);

  const originalUsers = useRef<User[]>([]);

  const toggleColors = () => {
    setShowColors(!showColors);
  };

  const toggleSortByCountry = () => {
    const newSortingValue =
      sorting === SortBy.NONE ? SortBy.COUNTRY : SortBy.NONE;
    setSorting(newSortingValue);
  };

  const handleDelete = (email: string) => {
    const filteredUsers = users.filter((user) => user.email !== email);
    setUsers(filteredUsers);
  };

  const handleReset = () => {
    setUsers(originalUsers.current);
  };

  const handleChangeSort = (sort: SortBy) => {
    setSorting(sort);
  };

  useEffect(() => {
    fetch("https://randomuser.me/api?results=100")
      .then(async (response) => response.json())
      .then((response) => {
        setUsers(response.results);
        originalUsers.current = response.results;
      })
      .catch((error) => console.error(error));
  }, []);

  const filteredUsers = useMemo(() => {
    console.log("Filtrando usuarios");

    return filterCountry != null && filterCountry.length > 0
      ? users.filter((user) => {
          return user.location.country
            .toLowerCase()
            .includes(filterCountry.toLowerCase());
        })
      : users;
  }, [users, filterCountry]);

  const sortedUsers = useMemo(() => {
    console.log("Ordenando usuarios");

    if (sorting === SortBy.NONE) {
      return filteredUsers;
    }

    const comparePropertie: Record<string, (user: User) => any> = {
      [SortBy.NAME]: (user: User) => user.name.first,
      [SortBy.LAST]: (user: User) => user.name.last,
      [SortBy.COUNTRY]: (user: User) => user.location.country,
    };

    return filteredUsers.slice().sort((a, b) => {
      const extractProperty = comparePropertie[sorting];
      return extractProperty(a).localeCompare(extractProperty(b));
    });
  }, [filteredUsers, sorting]);

  return (
    <>
      <h1>Prueba Tecnica</h1>
      <header>
        <button onClick={toggleColors}>Colorear Filas</button>
        <button onClick={toggleSortByCountry}>
          {sorting === SortBy.COUNTRY
            ? "No Ordenar Por País"
            : "Ordenar Por País"}
        </button>
        <button onClick={handleReset}>Resetear Estado</button>
        <input
          placeholder="Filtra por país"
          onChange={(e) => {
            setFilterCountry(e.target.value);
          }}
        />
      </header>
      <main>
        <UserList
          changeSorting={handleChangeSort}
          deleteUser={handleDelete}
          showColors={showColors}
          users={sortedUsers}
        ></UserList>
      </main>
    </>
  );
}

export default App;
