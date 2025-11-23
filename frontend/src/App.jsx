import { useState, useEffect} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [test, setTest] = useState([]);

    const fetchTest = async ()=> {
        try {
            const testResponse = await fetch("http://localhost:3000/tests")
            const data = await testResponse.json();

        setTest(data)
        } catch(error) {
            console.error('Помилка при завантаженні статистики:', error);
        }
    };

    useEffect(() => {
        fetchTest();
    }, []);

  return (
    <>
      <h1>{test.length > 0 ? test[0].country_name : "Завантаження..."}</h1>
    </>
  )
}

export default App
