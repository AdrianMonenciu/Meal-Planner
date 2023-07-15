import { useState } from "react"
import {dietPreferences} from "../../lib/dietPreference"

export default function TestPage() {

  let [dietPref, setDietPref] = useState("")

  let handleDietChange = (e) => {
    setDietPref(e.target.value)
  }

  return (
    <>
      <select onChange={handleDietChange}> 
        {dietPreferences.map((diet) => <option key={diet} value={diet}>{diet}</option>)}
      </select>
      <div> {dietPref} </div>
    </>

  )
}