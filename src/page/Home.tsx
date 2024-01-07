import { useLocalStorage } from 'usehooks-ts'

export default function Home() {
  const [isDarkTheme, setDarkTheme] = useLocalStorage('darkTheme')

  const toggleTheme = () => {
      setDarkTheme((prevValue: boolean) => !prevValue)
    }

    return (
      <button onClick={toggleTheme}>
        {`Home page theme is ${isDarkTheme ? `dark` : `light`}`}
      </button>
    )
}
