import {React, useState, useEffect, useRef } from 'react';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import imagesLoaded from 'imagesloaded';
import { Link, useNavigate } from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux'
// import bg from '../assets/09.jpg'
import axios from 'axios'
import '../App.css'
// import TripCard from '../components/TripCard';
// import { setToken, setUser } from '../redux/authSlice';
import mouse from '../assets/mouse.gif'
import bike from '../assets/bike.jpg'
import kiss from '../assets/kiss.jpg'
import Footer from '../components/Footer';
import { Logout } from '../redux/userSlice';
import TripCard from '../components/TripCard';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {

  const [data, setData ] = useState([])
  const {user} = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loaderRef = useRef(null);
  const demoWrapperRef = useRef(null);

  const fetchAllTrips = async() => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if(response.status != 200 )
      {
        console.log("error fetching response ")
        return;
      }
      console.log("response : ", response.data.data)
      setData(response.data.data);
    } catch (error) {
      console.log("Some error occured fetching details of all data: ", error);
      // console.log("error: ", response?.error);
    }
  }

  const handleLogout = ()=> {
    dispatch(Logout());
    navigate('/');
  }

 const AlertClick = ()=>{
    alert("alert working")
 }

  useEffect(() => {
    fetchAllTrips();
    const images = gsap.utils.toArray('img');
    const loader = loaderRef.current;
    const updateProgress = (instance) => {
      
      const progress = Math.round((instance.progressedCount * 100) / images.length);

      loader.textContent = `${progress}%`;
      if (progress === 100) {
        
        gsap.to(loader, { autoAlpha: 0, duration: 0.5 }); 
      }
    };

    const showDemo = () => {
      document.body.style.overflow = 'auto';
      document.scrollingElement.scrollTo(0, 0);
      gsap.to(loader.parentElement, { autoAlpha: 1 });

      gsap.utils.toArray('section').forEach((section, index) => {
        const w = section.querySelector('.wrapper');
        const [x, xEnd] = (index % 2) ? ['100%', (w.scrollWidth - section.offsetWidth) * -1] : [w.scrollWidth * -1, 0];
        gsap.fromTo(w, { x }, {
          x: xEnd,
          scrollTrigger: {
            trigger: section,
            
            scrub: 1
          }
        });
      });
    };

    imagesLoaded(images).on('progress', updateProgress).on('always', showDemo);
  }, [])


  return (
    <div className=" bg-offWhite sm:text-sm  ">
      <div ref={loaderRef} className="loader  inset-0 bg-black text-white flex items-center justify-center">
        <div>
          <h1 className="text-5xl">Loading</h1>
          <h2 ref={loaderRef} className="loader--text text-2xl bg-yellowAccent">0%</h2>
        </div>
      </div>
      <div ref={demoWrapperRef} className=" demo-wrapper overflow-x-hidden bg-yellowAccent">
        <header className="h-screen flex items-center justify-center">
          <div className='flex flex-col justify-center items-center gap-3'>
            <h1 className="text-5xl font-playfair">Scroll Down</h1>
            {/* <h2 className="text-2xl">demo</h2> */}
            <img className='w-10' src={mouse}></img>
          </div>
        </header>
        <section className="demo-text">
          <div className="wrapper  text text-[clamp(8rem,15vw,16rem)] leading-none text-black font-playfair">
            <span className='text-black' >TAKE</span>
            <span className='text-slate-600' >ME</span>
            <span className='text-black'>WITH</span>
            <span className='text-slate-600'>YOU</span>
          </div>
        </section>
        {/* {renderGallerySections()} */}
        <section className="demo-text">
          <div className="wrapper text-[clamp(8rem,15vw,16rem)] leading-none text-black font-playfair">
          <span className='text-slate-600 font-playfair' >TAKE</span>
            <span className='text-black' >ME</span>
            <span className='text-slate-600'>WITH</span>
            <span className='text-black'>YOU</span>
          </div>
        </section>
        <footer className="h-[50vh] flex items-center justify-center">
            {
                user == null && <div className='flex flex-row gap-3 items-center justify-center' >
                    <Link to='/register'>
                        <button>
                            <span className='box'>Sign up</span>
                        </button>
                    </Link>
                    <Link to='/login'>
                        <button>
                            <span className='box'>Login</span>
                        </button>
                    </Link>
                </div>
            }
            {
                user  && <div className='flex flex-row gap-3 items-center justify-center' >
                    
                    
                        <button onClick = {handleLogout}>
                            <span className='box'>Logout</span>
                        </button>
                    
                </div>
            }
        </footer>
      </div>
      {/* <img src={person} alt="alternate" /> */}
      {/* what is TakemewithYou */}
      <h2 className='text-6xl text-right -mt-10 font-playfair bg-black text-offWhite  p-10' >We are the "Angels" for you :)</h2>
        <div className='flex justify-evenly h-full  items-center bg-offWhite  '>
          <div className='flex flex-col gap-4 ml-2 w-[40%]'>
            
            <div className='p-3 bg-offWhite font-playfair w-[100%]  ' > <span className='font-playfair text-6xl italic'>TakemewithYou </span >is a Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident tenetur aliquid quasi facere illo, reprehenderit pariatur unde, fuga iusto, neque impedit. Quo, tempore nesciunt. Quisquam amet ducimus facere illum omnis quaerat blanditiis officiis, delectus voluptate vitae iusto nemo provident assumenda eius error molestias excepturi mollitia.iciis, delectus voluptate vitae iusto nemo provident assumenda eius error molestias excepturi mollitia. FIND YOUR SPARK !!
            
            </div>
            <div>
              <button class="button">
              Get Started
                  <span class="button-span"> ─ it's free</span>
              </button>
            </div>
            
          </div>
        
          <div className='bg-black w-[60%]'>
            <img  src={bike} alt="a image of group of friends on a trip" loading = 'lazy' />
          </div>
        </div>
      <h2 className='text-6xl text-left  font-playfair bg-black text-offWhite  p-10' >Find your next Spark ;)</h2>
        <div className='flex flex-row-reverse justify-evenly h-full  items-center bg-secondaryRed  '>
          <div className='flex flex-col gap-4 ml-2 w-[40%]'>
            
            <div className='p-3  font-playfair w-[100%] text-offWhite ' > <span className='font-playfair text-6xl italic'>TakemewithYou </span >is a Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident tenetur aliquid quasi facere illo, reprehenderit pariatur unde, fuga iusto, neque impedit. Quo, tempore nesciunt. Quisquam amet ducimus facere illum omnis quaerat blanditiis officiis, delectus voluptate vitae iusto nemo provident assumenda eius error molestias excepturi mollitia.iciis, delectus voluptate vitae iusto nemo provident assumenda eius error molestias excepturi mollitia. FIND YOUR SPARK !!
            
            </div>
            <div>
              <button class="button">
              Get Started
                  <span class="button-span"> ─ it's free</span>
              </button>
            </div>
            
          </div>
        
          <div className='bg-black w-[60%]'>
            <img  src={kiss} alt="a image of group of friends on a trip" loading = 'lazy' />
          </div>
        </div>

        <h2 className='text-6xl text-right  font-playfair bg-black text-offWhite  p-10' >Another section</h2>
        <div className='flex flex-row justify-evenly h-full  items-center bg-offWhite  '>
          <div className='flex flex-col gap-4 ml-2 w-[40%]'>
            
            <div className='p-3  font-playfair w-[100%] text-black ' > <span className='font-playfair text-6xl italic'>TakemewithYou </span >is a Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident tenetur aliquid quasi facere illo, reprehenderit pariatur unde, fuga iusto, neque impedit. Quo, tempore nesciunt. Quisquam amet ducimus facere illum omnis quaerat blanditiis officiis, delectus voluptate vitae iusto nemo provident assumenda eius error molestias excepturi mollitia.iciis, delectus voluptate vitae iusto nemo provident assumenda eius error molestias excepturi mollitia. FIND YOUR SPARK !!
            
            </div>
            <div>
              <button class="button">
              Get Started
                  <span class="button-span"> ─ it's free</span>
              </button>
            </div>
            
          </div>
        
          <div className='bg-black w-[60%]'>
            <img  src={bike} alt="a image of group of friends on a trip" loading = 'lazy' />
          </div>
        </div>

        

        {/* section-3 Trip cards display */}

        
        
      
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                

                    {data.map((trip, index) => (
                        <TripCard
                            key={trip._id || index} 
                            title={trip.title}
                            source={trip.source}
                            destination={trip.destination}
                            dates={trip.dates}
                            itinerary={trip.itinerary}
                            budget={trip.budget}
                            participants={trip.participants}
                            createdAt={trip.createdAt}
                            creator={trip.creator?.firstName} 
                            creatorId={trip.creator?._id}
                            creatorEmail={trip.creator?.email} 
                            tripId={trip._id}
                        />
                    ))}

            </div> */}
<h2 className='text-6xl text-left  font-playfair bg-black text-offWhite  p-10' >Cards section</h2>

<div class="overflow-x-hidden relative w-[90%] mb-11 mt-11   h-auto mx-auto cards">
<div class="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-offWhite to-transparent z-10"></div>
 
  <div class="flex items-center justify-start space-x-6  h-auto w-full animate-scroll">
    {data.concat(data).map((trip, index) => (
      <div key={trip._id || index} class="flex-shrink-0   ">
        <TripCard
          name={trip.userId?.firstName}
          description={trip.description}
          image ={trip.imageUrl}
          
        />
      </div>
    ))}
  </div>
    <div class="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-offWhite to-transparent z-10"></div>
</div>

    <Footer/>

    </div>
);
};


export default Hero;


{/* <div
        className="relative bgimage h-screen w-screen flex flex-col  bg-cover bg-center"
        
    >
       
        <div className="absolute inset-0 bg-black opacity-50"></div>

       
        <div className="relative z-10 text-center text-white px-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">TakemewithYou</h1>
            <p className="text-lg md:text-xl mb-8">
                Discover your next adventure with us. Sign up now and start exploring!
            </p>

            
            {
                currentUser == null && <div className="flex justify-center space-x-4 mb-8">
                <Link to="/signup">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition duration-300">
                        Sign Up
                    </button>
                </Link>
                <Link to="/login">
                    <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition duration-300">
                        Login
                    </button>
                </Link>
            </div>
            }
            {
                currentUser && <div className="flex justify-center space-x-4 mb-8">
                <Link to={`/dashboard/${currentUser._id}`}>
                    <button className="bg-violet-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition duration-300">
                        Dashboard
                    </button>
                </Link>
                
                    <button onClick = {handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition duration-300">
                        Logout
                    </button>
                    <button onClick = {AlertClick} className="bg-yellow-600 hover:bg-pink-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition duration-300">
                        Alert
                    </button>
                
            </div>
            }
        </div>

        
        <div className="absolute bottom-0 left-0 right-0 top-[20%] overflow-y-auto p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                

                    {data.map((trip, index) => (
                        <TripCard
                            key={trip._id || index} 
                            title={trip.title}
                            source={trip.source}
                            destination={trip.destination}
                            dates={trip.dates}
                            itinerary={trip.itinerary}
                            budget={trip.budget}
                            participants={trip.participants}
                            createdAt={trip.createdAt}
                            creator={trip.creator?.firstName} 
                            creatorId={trip.creator?._id}
                            creatorEmail={trip.creator?.email} 
                            tripId={trip._id}
                        />
                    ))}

            </div>
        </div>
    </div> */}