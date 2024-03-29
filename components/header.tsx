import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import styles from "./header.module.css"
import { Image } from "cloudinary-react";
import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp } from "@fortawesome/free-solid-svg-icons";

export default function Header() {
  const [showPopup, setShowPopup] = useState(false);

  const { data: session, status } = useSession()
  const loading = status === "loading"

  const timeoutRef = useRef(null);

  function closePopup() {
    timeoutRef.current = setTimeout(() => {
      setShowPopup(false);
    }, 500);
  }

  function cancelClosePopup() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }

  function handleImageClick() {
    setShowPopup(!showPopup);
  }

  const [selectedButton, setSelectedButton] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [selectedButtonSmall, setSelectedButtonSmall] = useState("")

  function toggleMenu () {
    setIsOpen(!isOpen);
    setSelectedButtonSmall("");
  };

  //Popup box component
  function Popup() {
    return (
      <div className={styles.popup_content}>
        <span className={`flex-col text-xs items-center`}>
          <strong>{`${session.user.email ?? session.user.username}` }</strong>
          <div>{`Role: ${session.user.userRole}` }</div>
        </span>
        <a
          href={`/api/auth/signout`}
          className={`${styles.buttonPrimary} mb-1 mt-2 bg-red-400`}
          onClick={(e) => {
            e.preventDefault()
            signOut()
          }}
        >
          Sign out
        </a>
        <br></br>
        <a
          href={`/user/view`}
          className={`${styles.buttonPrimary} bg-teal-400 mb-1`}
        >
          View Profile
        </a>
        <br></br>
        <a
          href={`/user/update`}
          className={`${styles.buttonPrimary} bg-sky-300 mb-1`}
        >
          Update Profile
        </a>
        {session?.user.userRole == 'admin' && (
          <>
            <br></br> 
            <a
              href={`/user/updateUsers`}
              className={`${styles.buttonPrimary} bg-cyan-300`}
            >
              Update Users
            </a>
          </>
        )}

      </div>
    );
  }

  const HamburgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedButtonSmall, setSelectedButtonSmall] = useState("")

    const toggleMenu = () => {
      setIsOpen(!isOpen);
      setSelectedButtonSmall("");
    };

    return (
      <nav className="md:hidden">
        <div className="flex justify-end">
          <button
            className={`text-gray-900 transition transform duration-300 ${isOpen ? "rotate-90" : ""}`}
            onClick={toggleMenu}
          >
            {isOpen ? (
            // Show the "X" icon when the menu is open
              <svg
                className="h-6 w-6 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M12 10.586L16.95 5.636a1 1 0 0 1 1.414 1.414L13.414 12l4.95 4.95a1 1 0 1 1-1.414 1.414L12 13.414l-4.95 4.95a1 1 0 0 1-1.414-1.414L10.586 12 5.636 7.05A1 1 0 0 1 7.05 5.636L12 10.586z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
            // Show the "hamburger" icon when the menu is closed
              <svg
                className="h-6 w-6 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="4" y="5"
                  width="16" height="2" />
                <rect x="4" y="11"
                  width="16" height="2" />
                <rect x="4" y="17"
                  width="16" height="2" />
              </svg>
            )}
          </button>
        </div>
        {isOpen && (
          <div className="absolute top-14 left-0 w-full h-screen bg-white z-9999">
            <div className="p-6">

              <div className='px-3 border-b-4 border-gray-500 h-14 flex items-center'>
                <Link className={styles.menu_button} href="/">Home</Link>
              </div>

              <div 
                onClick={() => setSelectedButtonSmall((prevButton) => prevButton !== "Ingredients/Snacks" ? "Ingredients/Snacks" : "")}
                className={`px-3 border-b-4 border-gray-500 `}>
                <button
                  className={`${styles.menu_button} py-2`}
                >
                  Foods and Meals
                </button>

                <FontAwesomeIcon
                  icon={faAngleUp}
                  className={`pl-2 pr-2 text-black transition-all duration-300 ease-in-out transform ${selectedButtonSmall === "Ingredients/Snacks" ? "rotate-180" : "rotate-0"}`}
                />

                <div className={`text-sm flex overflow-hidden transition-all duration-500 ease-in-out ${selectedButtonSmall === "Ingredients/Snacks" ? "max-h-40" :
                  "max-h-0"} `}
                style={{ transformOrigin: "top" }}>

                  <ul className={styles.navItems}>
                    <li className={styles.navItem}>
                      <Link href="/meal/foodItem">Add Ingredient/Snack</Link>
                    </li>
                    <li className={styles.navItem}>
                      <Link href="/meal/updatefoodItems">Update Ingredient/Snack</Link>
                    </li>
                    <li className={styles.navItem}>
                      <Link href="/meal/meal">Add Meal</Link>
                    </li>
                    <li className={styles.navItem}>
                      <Link href="/meal/updateMeals">Update Meals</Link>
                    </li>
                  </ul>
                </div>
              </div>

              <div 
                onClick={() => setSelectedButtonSmall((prevButton) => prevButton !== "Meals" ? "Meals" : "")}
                className={`px-3 border-b-4 border-gray-500 `}>
                <button
                  className={`${styles.menu_button} py-2`}
                >
                  Weekly Plan
                </button>

                <FontAwesomeIcon
                  icon={faAngleUp}
                  className={`pl-2 pr-2 text-black transition-all duration-300 ease-in-out transform ${selectedButtonSmall === "Meals" ? "rotate-180" : "rotate-0"}`}
                />

                <div className={`text-sm flex overflow-hidden transition-all duration-500 ease-in-out ${selectedButtonSmall === "Meals" ? "max-h-40" :
                  "max-h-0"} `}
                style={{ transformOrigin: "top" }}>

                  <ul className={styles.navItems}>
                    <li className={styles.navItem}>
                      <Link href="/meal/weeklyPlan">New Weekly Plan</Link>
                    </li>
                    <li className={styles.navItem}>
                      <Link href="/meal/updateWeeklyPlan">Update Weekly Plan</Link>
                    </li>
                  </ul>

                </div> 
              </div>

              <div 
                onClick={() => setSelectedButtonSmall((prevButton) => prevButton !== "Weekly Plan" ? "Weekly Plan" : "")}
                className={`px-3 border-b-4 border-gray-500 `}>
                <button
                  className={`${styles.menu_button} py-2`}
                >
                  Shopping List
                </button>

                <FontAwesomeIcon
                  icon={faAngleUp}
                  className={`pl-2 pr-2 text-black transition-all duration-300 ease-in-out transform ${selectedButtonSmall === "Weekly Plan" ? "rotate-180" : "rotate-0"}`}
                />

                <div className={`text-sm flex overflow-hidden transition-all duration-500 ease-in-out ${selectedButtonSmall === "Weekly Plan" ? "max-h-40" :
                  "max-h-0"} `}
                style={{ transformOrigin: "top" }}>

                  <ul className={styles.navItems}>
                    <li className={styles.navItem}>
                      <Link href="/meal/updateShoppingList">Update Shopping List</Link>
                    </li>
                  </ul>

                </div> 
              </div>

            </div>
          </div>
        )}
      </nav>
    );
  };

  return (
    <header>
      
      <div className={styles.signedInStatus}>
        <div
          className={`${
            !session && loading ? styles.loading : styles.loaded
          } bg-green-400`}
        >
          {!session && (
            <div className="h-14 flex justify-between items-center">
              <span className={styles.notSignedInText}>
                You are not signed in
              </span>
              <span className="">
                <a
                  href={`/user/login`} 
                  className={styles.buttonPrimary}
                >
                  Sign in
                </a>
                <a
                  href={`/user/register`}
                  className={styles.buttonPrimary}
                >
                  Register
                </a>
              </span>
            </div>
          )}
          {session?.user && (
            <div className="flex justify-between items-center h-full">
            
              <ul className='hidden h-14 md:flex items-center'>
                <li className={styles.navItem}>
                  <Link href="/">Home</Link>
                </li>
              </ul>
              
              <div 
                onMouseEnter={() => setSelectedButton("Ingredients/Snacks")}
                onMouseLeave={() => setSelectedButton("")} 
                className={`hidden md:block relative px-3 border-b-4  ${selectedButton === "Ingredients/Snacks" ? 'border-gray-500' : 'border-transparent'}`}>
                <button
                  className={`${styles.menu_button} h-14 top-0 `}
                >
                    Foods and Meals  
                </button>

                <FontAwesomeIcon
                  icon={selectedButton === "Ingredients/Snacks" ? faAngleUp : faAngleUp}
                  className={`pl-2 pr-2 text-black transition-all duration-500 ease-in-out transform ${selectedButton === "Ingredients/Snacks" ? "rotate-180" : "rotate-0"}`}
                />

                <div className={`text-sm translate-y-1 flex w-full bg-green-300  absolute top-full left-0 z-2 overflow-hidden transition-all duration-300 ease-in-out
                transform ${selectedButton === "Ingredients/Snacks" ? "max-h-40" : "max-h-0"}`} 
                >
                  <ul className={styles.navItems}>
                    <li className={styles.navItem}>
                      <Link href="/meal/foodItem">Add Ingredient/Snack</Link>
                    </li>
                    <li className={styles.navItem}>
                      <Link href="/meal/updatefoodItems">Update Ingredient/Snack</Link>
                    </li>
                    <li className={styles.navItem}>
                      <Link href="/meal/meal">Add Meal</Link>
                    </li>
                    <li className={styles.navItem}>
                      <Link href="/meal/updateMeals">Update Meals</Link>
                    </li>
                  </ul>
                </div>
              </div>


              <div 
                onMouseEnter={() => setSelectedButton("Meals")}
                onMouseLeave={() => setSelectedButton("")} 
                className={`hidden md:block relative px-4 border-b-4 ${selectedButton === "Meals" ? 'border-gray-500' : 'border-transparent'}`}>
                <button
                  className={`${styles.menu_button} h-14 top-0 `}
                >
                  Weekly Plan
                </button>

                <FontAwesomeIcon
                  icon={selectedButton === "Meals" ? faAngleUp : faAngleUp}
                  className={`pl-2 pr-2 text-black transition-all duration-500 ease-in-out transform ${selectedButton === "Meals" ? "rotate-180" : "rotate-0"}`}
                />

                <div className={`text-sm translate-y-1 flex w-full bg-green-300  absolute top-full left-0 z-2 overflow-hidden transition-all duration-300 ease-in-out
                transform ${selectedButton === "Meals" ? "max-h-40" : "max-h-0"}`} 
                >
                  <ul className={styles.navItems}>
                    <li className={styles.navItem}>
                      <Link href="/meal/weeklyPlan">New Weekly Plan</Link>
                    </li>
                    <li className={styles.navItem}>
                      <Link href="/meal/updateWeeklyPlan">Update Weekly Plan</Link>
                    </li>
                  </ul>
                </div>
              </div>


              <div 
                onMouseEnter={() => setSelectedButton("Weekly Plan")}
                onMouseLeave={() => setSelectedButton("")} 
                className={`hidden md:block relative px-3 border-b-4 ${selectedButton === "Weekly Plan" ? 'border-gray-500' : 'border-transparent'}`}>
                <button
                  className={`${styles.menu_button} h-14 top-0 `}
                >
                  Shopping List
                </button>

                <FontAwesomeIcon
                  icon={selectedButton === "Weekly Plan" ? faAngleUp : faAngleUp}
                  className={`pl-2 pr-2 text-black transition-all duration-500 ease-in-out transform ${selectedButton === "Weekly Plan" ? "rotate-180" : "rotate-0"}`}
                />

                <div className={`text-sm translate-y-1 flex w-full bg-green-300  absolute top-full left-0 z-2 overflow-hidden transition-all duration-300 ease-in-out
                transform ${selectedButton === "Weekly Plan" ? "max-h-40" : "max-h-0"}`} 
                >
                  <ul className={styles.navItems}>
                    <li className={styles.navItem}>
                      <Link href="/meal/updateShoppingList">Update Shopping List</Link>
                    </li>
                  </ul>
          
                </div> 
              </div>



              {/* HamurgherMenu */}
              <nav className="md:hidden">
                <div className="flex justify-end">
                  <button
                    className={`text-gray-900 transition transform duration-300 ${isOpen ? "rotate-90" : ""}`}
                    onClick={toggleMenu}
                  >
                    {isOpen ? (
                    // Show the "X" icon when the menu is open
                      <svg
                        className="h-6 w-6 fill-current"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 10.586L16.95 5.636a1 1 0 0 1 1.414 1.414L13.414 12l4.95 4.95a1 1 0 1 1-1.414 1.414L12 13.414l-4.95 4.95a1 1 0 0 1-1.414-1.414L10.586 12 5.636 7.05A1 1 0 0 1 7.05 5.636L12 10.586z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                    // Show the "hamburger" icon when the menu is closed
                      <svg
                        className="h-6 w-6 fill-current"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect x="4" y="5"
                          width="16" height="2" />
                        <rect x="4" y="11"
                          width="16" height="2" />
                        <rect x="4" y="17"
                          width="16" height="2" />
                      </svg>
                    )}
                  </button>
                </div>
                {isOpen && (
                  <div className="absolute top-14 left-0 w-full h-screen bg-white z-9999">
                    <div className="p-6">

                      <div className='px-3 border-b-4 border-gray-500 h-14 flex items-center'>
                        <Link className={styles.menu_button} href="/">Home</Link>
                      </div>

                      <div 
                        onClick={() => setSelectedButtonSmall((prevButton) => prevButton !== "Ingredients/Snacks" ? "Ingredients/Snacks" : "")}
                        className={`px-3 border-b-4 border-gray-500 `}>
                        <button
                          className={`${styles.menu_button} py-2`}
                        >
                          Foods and Meals
                        </button>

                        <FontAwesomeIcon
                          icon={faAngleUp}
                          className={`pl-2 pr-2 text-black transition-all duration-300 ease-in-out transform ${selectedButtonSmall === "Ingredients/Snacks" ? "rotate-180" : "rotate-0"}`}
                        />

                        <div className={`text-sm flex overflow-hidden transition-all duration-500 ease-in-out ${selectedButtonSmall === "Ingredients/Snacks" ? "max-h-40" :
                          "max-h-0"} `}
                        style={{ transformOrigin: "top" }}>

                          <ul className={styles.navItems}>
                            <li className={styles.navItem}>
                              <Link href="/meal/foodItem">Add Ingredient/Snack</Link>
                            </li>
                            <li className={styles.navItem}>
                              <Link href="/meal/updatefoodItems">Update Ingredient/Snack</Link>
                            </li>
                            <li className={styles.navItem}>
                              <Link href="/meal/meal">Add Meal</Link>
                            </li>
                            <li className={styles.navItem}>
                              <Link href="/meal/updateMeals">Update Meals</Link>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div 
                        onClick={() => setSelectedButtonSmall((prevButton) => prevButton !== "Meals" ? "Meals" : "")}
                        className={`px-3 border-b-4 border-gray-500 `}>
                        <button
                          className={`${styles.menu_button} py-2`}
                        >
                          Weekly Plan
                        </button>

                        <FontAwesomeIcon
                          icon={faAngleUp}
                          className={`pl-2 pr-2 text-black transition-all duration-300 ease-in-out transform ${selectedButtonSmall === "Meals" ? "rotate-180" : "rotate-0"}`}
                        />

                        <div className={`text-sm flex overflow-hidden transition-all duration-500 ease-in-out ${selectedButtonSmall === "Meals" ? "max-h-40" :
                          "max-h-0"} `}
                        style={{ transformOrigin: "top" }}>

                          <ul className={styles.navItems}>
                            <li className={styles.navItem}>
                              <Link href="/meal/weeklyPlan">New Weekly Plan</Link>
                            </li>
                            <li className={styles.navItem}>
                              <Link href="/meal/updateWeeklyPlan">Update Weekly Plan</Link>
                            </li>
                          </ul>

                        </div> 
                      </div>

                      <div 
                        onClick={() => setSelectedButtonSmall((prevButton) => prevButton !== "Weekly Plan" ? "Weekly Plan" : "")}
                        className={`px-3 border-b-4 border-gray-500 `}>
                        <button
                          className={`${styles.menu_button} py-2`}
                        >
                          Shopping List
                        </button>

                        <FontAwesomeIcon
                          icon={faAngleUp}
                          className={`pl-2 pr-2 text-black transition-all duration-300 ease-in-out transform ${selectedButtonSmall === "Weekly Plan" ? "rotate-180" : "rotate-0"}`}
                        />

                        <div className={`text-sm flex overflow-hidden transition-all duration-500 ease-in-out ${selectedButtonSmall === "Weekly Plan" ? "max-h-40" :
                          "max-h-0"} `}
                        style={{ transformOrigin: "top" }}>

                          <ul className={styles.navItems}>
                            <li className={styles.navItem}>
                              <Link href="/meal/updateShoppingList">Update Shopping List</Link>
                            </li>
                          </ul>

                        </div> 
                      </div>

                    </div>
                  </div>
                )}
              </nav>




              <div className="flex">
                {session.user.image && (
                  <div className="flex items-center my-1 md:my-0">
                    <div className={`${styles.image_container} flex items-center`} onMouseLeave={closePopup}
                      onMouseEnter={cancelClosePopup}>
                      <Image
                        className={`${styles.avatar} border-2 hover:cursor-pointer ${showPopup ? 'border-black' : 'border-green-400'}`}
                        cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                        publicId={session.user.image}
                        alt={session.user.image}
                        secure
                        dpr="auto"
                        quality="auto"
                        width={350}
                        height={350}
                        crop="fill"
                        gravity="auto"
                        onClick={handleImageClick}
                      />
                      {showPopup && (
                        <div className={styles.popup}>
                          <Popup />
                        </div>
                      )}
                    </div>
                    
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  )
}