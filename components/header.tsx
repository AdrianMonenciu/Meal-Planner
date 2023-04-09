import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import styles from "./header.module.css"
import { Image } from "cloudinary-react";
import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp } from "@fortawesome/free-solid-svg-icons";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
  const [showPopup, setShowPopup] = useState(false);

  const { data: session, status } = useSession()
  const loading = status === "loading"

  const timeoutRef = useRef(null);

  function closePopup() {
    timeoutRef.current = setTimeout(() => {
      setShowPopup(false);
    }, 1000);
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


  function Popup() {
    return (
      <div className={styles.popup_content} onMouseLeave={closePopup} onMouseEnter={cancelClosePopup}>
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
          href={`/user/update`}
          className={`${styles.buttonPrimary} bg-sky-300 mb-1`}
        >
          Update
        </a>
        <br></br>
        
        <a
          href={`/user/updateUsers`}
          className={`${styles.buttonPrimary} bg-cyan-300`}
        >
          Update Users
        </a>

      </div>
    );
  }

  

  const HamburgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleMenu = () => {
      setIsOpen(!isOpen);
    };

    const [selectedButtonSmall, setSelectedButtonSmall] = useState("")

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
                d="M18.3 5.7a1 1 0 1 1 1.4 1.4L13.42 12l6.3 6.3a1 1 0 1 1-1.4 1.4L12 13.42l-6.3 6.3a1 1 0 0 1-1.4-1.4L10.58 12 4.3 5.7A1 1 0 0 1 5.7 4.3l6.3 6.3 6.3-6.3a1 1 0 0 1 1.4 0z"
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
              <rect x="4" y="5" width="16" height="2" />
              <rect x="4" y="11" width="16" height="2" />
              <rect x="4" y="17" width="16" height="2" />
            </svg>
          )}
          </button>
        </div>
        {isOpen && (
          <div className="absolute top-14 left-0 w-full h-screen bg-white z-9999">
            <div className="p-6">
              <ul>

              <div 
              onClick={() => setSelectedButtonSmall((prevButton) => prevButton !== "Ingredients/Snacks" ? "Ingredients/Snacks" : "")}
              className={`px-3 border-b-4 border-gray-500 `}>
                <button
                  className={`${styles.menu_button} h-14 top-0 `}
                >
                  Ingredients/Snacks
                </button>

                <FontAwesomeIcon
                  icon={faAngleUp}
                  className={`pl-2 pr-2 text-black transition-all duration-300 ease-in-out transform ${selectedButtonSmall === "Ingredients/Snacks" ? "rotate-180" : "rotate-0"}`}
                />

               

<div className={`text-sm flex w-full overflow-hidden 
${selectedButtonSmall === "Ingredients/Snacks" ? "max-h-40 transition-all duration-500 ease-in-out" : "max-h-0 transition-all duration-500 ease-in-out"} `}
    style={{ transformOrigin: "top" }}>

    <ul className={styles.navItems}>
      <li className={styles.navItem}>
        <Link href="/meal/foodItem">Add Ingredient/Snack</Link>
      </li>
      <li className={styles.navItem}>
        <Link href="/meal/updatefoodItems">Update Ingredient/Snack</Link>
      </li>
    </ul>
  </div>

                
              </div>

                <li className="mt-4 block text-gray-800 menuItemTitle"> Products
                  <ul className="mt-2">
                    <li className="block py-2 text-gray-800 hover:text-gray-900 menuItem">
                      <Link href="/products/item1">Item 1</Link>
                    </li>
                    <li className="block py-2 text-gray-800 hover:text-gray-900 menuItem">
                      <Link href="/products/item2">Item 2</Link>
                    </li>
                    <li className="block py-2 text-gray-800 hover:text-gray-900 menuItem">
                      <Link href="/products/item3">Item 3</Link>
                    </li>
                  </ul>
                </li>
                <li className="mt-4 block text-gray-800 menuItemTitle">About Us
                  <ul className="mt-2">
                    <li className="block py-2 text-gray-800 hover:text-gray-900 menuItem">
                      <Link href="/about/team">Our Team</Link>
                    </li>
                    <li className="block py-2 text-gray-800 hover:text-gray-900 menuItem">
                      <Link href="/about/story">Our Story</Link>
                    </li>
                    <li className="block py-2 text-gray-800 hover:text-gray-900 menuItem">
                      <Link href="/about/contact">Contact Us</Link>
                    </li>
                  </ul>
                </li>
              </ul>
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
            <>
              <span className={styles.notSignedInText}>
                You are not signed in
              </span>
              <span className="flex justify-end">
                <a
                  href={`/user/login`} ///api/auth/signin
                  className={styles.buttonPrimary}
                  // onClick={(e) => {
                  //   e.preventDefault()
                  //   signIn()
                  // }}
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
            </>
          )}
          {session?.user && (
            <div className="flex justify-between items-center h-full">
            
              <ul className='h-14 flex items-center'>
                <li className={styles.navItem}>
                  <Link href="/">Home</Link>
                </li>
              </ul>
              
              <div 
              onMouseEnter={() => setSelectedButton("Ingredients/Snacks")}
              onMouseLeave={() => setSelectedButton("")} 
              className={`hidden md:block relative px-3 border-b-4 border-transparent ${selectedButton === "Ingredients/Snacks" ? 'border-gray-500' : ''}`}>
                <button
                  className={`${styles.menu_button} h-14 top-0 `}
                >
                  Ingredients/Snacks
                </button>

                <FontAwesomeIcon
                  icon={selectedButton === "Ingredients/Snacks" ? faAngleUp : faAngleUp}
                  className={`pl-2 pr-2 text-black transition-all duration-500 ease-in-out transform ${selectedButton === "Ingredients/Snacks" ? "rotate-180" : "rotate-0"}`}
                />

                <div className={`text-sm translate-y-1 flex w-full bg-green-200  absolute top-full left-0 z-2 transition-all duration-300 ease-in-out
                transform ${selectedButton === "Ingredients/Snacks" ? "opacity-100" : "opacity-0"}`} 
                >
                  <ul className={styles.navItems}>
                    <li className={styles.navItem}>
                      <Link href="/meal/foodItem">Add Ingredient/Snack</Link>
                    </li>
                    <li className={styles.navItem}>
                      <Link href="/meal/updatefoodItems">Update Ingredient/Snack</Link>
                    </li>
                  </ul>
                </div>
              </div>


              <div 
              onMouseEnter={() => setSelectedButton("Meals")}
              onMouseLeave={() => setSelectedButton("")} 
              className={`hidden md:block relative px-4 border-b-4 border-transparent ${selectedButton === "Meals" ? 'border-gray-500' : ''}`}>
                <button
                  className={`${styles.menu_button} h-14 top-0 `}
                >
                  Meals
                </button>

                <FontAwesomeIcon
                  icon={selectedButton === "Meals" ? faAngleUp : faAngleUp}
                  className={`pl-2 pr-2 text-black transition-all duration-500 ease-in-out transform ${selectedButton === "Meals" ? "rotate-180" : "rotate-0"}`}
                />

                <div className={`text-sm translate-y-1 flex w-full bg-green-200  absolute top-full left-0 z-2 transition-all duration-300 ease-in-out
                transform ${selectedButton === "Meals" ? "opacity-100" : "opacity-0"}`} 
                >
                  <ul className={styles.navItems}>
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
              onMouseEnter={() => setSelectedButton("Weekly Plan")}
              onMouseLeave={() => setSelectedButton("")} 
              className={`hidden md:block relative px-3 border-b-4 border-transparent ${selectedButton === "Weekly Plan" ? 'border-gray-500' : ''}`}>
                <button
                  className={`${styles.menu_button} h-14 top-0 `}
                >
                  Weekly Plan
                </button>

                <FontAwesomeIcon
                  icon={selectedButton === "Weekly Plan" ? faAngleUp : faAngleUp}
                  className={`pl-2 pr-2 text-black transition-all duration-500 ease-in-out transform ${selectedButton === "Weekly Plan" ? "rotate-180" : "rotate-0"}`}
                />

                <div className={`text-sm translate-y-1 flex w-full bg-green-200  absolute top-full left-0 z-2 transition-all duration-300 ease-in-out
                transform ${selectedButton === "Weekly Plan" ? "opacity-100" : "opacity-0"}`} 
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

              <HamburgerMenu />


              <div className="flex">
                {session.user.image && (
                  <div className="flex items-center">
                    <div className={`${styles.image_container} flex items-center`} onMouseLeave={closePopup} onMouseEnter={cancelClosePopup}>
                      <Image
                        className={styles.avatar}
                        cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                        publicId={session.user.image}
                        alt={session.user.image}
                        secure
                        dpr="auto"
                        quality="auto"
                        width={200}
                        height={200}
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
                    <span className={`ml-3 flex-col text-xs items-center`}>
                      <strong>{`${session.user.email ?? session.user.username}` }</strong>
                      <div>{`Role: ${session.user.userRole}` }</div>
                    </span>
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
