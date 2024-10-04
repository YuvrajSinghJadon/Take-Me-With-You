import React from 'react';
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {Link} from 'react-router-dom'
// import { messaging } from '../firebase';
// import { getMessaging, getToken, onMessage } from 'firebase/messaging';


const TripCard = ({ name, description, image }) => {

    const navigate = useNavigate();
    const {user} = useSelector((state) => state.user)
    // console.log("tripId: ", tripId)
    
    let userId ;
    let token ;
    if(user)
    {
        userId = user._id;
    }
    else{
        userId = null;
    }
    if(user)
    {
        token = user.token;
    }
    else{
        token = null;
    }

    const joinTripApi = async() => {
        // console.log("userid: ", userId)
        try {
            if(!user)
            {
                navigate('/login')
                return;
            }
            else{
                const response = await axios.post(`/api/v1/join-trip/${userId}`, {tripId: tripId, token: token, userId: userId })
                if(response.success == false )
                {
                    console.log("error joining trip, server responded with bad status: ",response.data.message)
                    return;
                }
                console.log("request for join sent successfull");
                alert("message join req sent")
                navigate('/joined');
            }
        } catch (error) {
            console.log('Somethign went wrong joining trip: ', error.response.data.message)
        }
    }

    const AlertUnableToJoin = () => {
        alert("Can't join the trip that you created")
    }


    return (
        <div onClick={() => navigate('/login')} className = 'box cursor-pointer  border-2 w-[300px] overflow-y-auto flex flex-col bg-transparent'>
            <div>
                <img className='object-cover w-[100%] h-[180px]  ' src={image} />
                {/* <img className='object-cover w-[100%] h-[180px]  ' src="https://images.unsplash.com/photo-1488161628813-04466f872be2?crop=entropy&cs=srgb&fm=jpg&ixid=MnwxNDU4OXwwfDF8cmFuZG9tfHx8fHx8fHx8MTYyMzMxNTMwNQ&ixlib=rb-1.2.1&q=85" alt="imagae of a traveller" /> */}
            </div>
            <div className='flex flex-col gap-1 '>
                <p className='font-playfair text-black text-xl font-normal' >{name}</p>
                {/* <span className='font-playfair font-normal normal-case italic text-gray-500 text-sm' >{creatorEmail}</span> */}
            </div>
            <div>
                <p className='text-black text-left font-normal text-md italic  normal-case' >{name} has planned the trip . <span className='font-semibold'>{description}</span> Then after this, write some information about the creator that you must have taken while they created their profile. This stuff must not be so long in order to maintain the size and figure of the card. </p>
            </div>
            <div className='mt-2'>
                <Link to='/login'>
                    <button className='cursor-pointer p-2 text-center text-black bg-secondaryRed font-serif ' >
                        Explore more
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default TripCard;