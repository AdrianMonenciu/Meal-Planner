import { useState } from "react"
import {dietPreferences} from "../lib/dietPreference"

export default function testPage() {

// Using state to keep track of what the selected fruit is
let [dietPref, setDietPref] = useState("")


// Using this function to update the state of fruit
// whenever a new option is selected from the dropdown
let handleDietChange = (e) => {
  //console.log(e.target.value)
  setDietPref(e.target.value)
  //console.log(dietPref)
}

//(e) => setDietPref(e.target.value)

  return (
    <>
       <select onChange={handleDietChange}> 
      {/*<option value="⬇️ Select a fruit ⬇️"> -- Select a Diet Plan -- </option>*/}
            {/* Mapping through each fruit object in our fruits array
          and returning an option element with the appropriate attributes / values.
         */}
      {dietPreferences.map((diet) => <option key={diet} value={diet}>{diet}</option>)}
    </select>
         <div> {dietPref} </div>
    </>

  )
}