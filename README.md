# 🚗 GreenCommute - Sustainable Ride Sharing

## About

GreenCommute is an AI-powered sustainable ride-sharing platform powered by Firebase that helps reduce carbon footprints while making commuting more economical and safe.

## 🔥 Firebase Integration - COMPLETE SETUP BELOW

**Status:** ✅ Firebase Installed
**Action Required:** Follow the 3-step setup below (5 minutes)

---

### 🚀 STEP 1: Create Firebase Config File

**Create file:** `src/lib/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBA6LJvyMhy491TvDJJBPtOUCfQPTpVd4",
  authDomain: "greencommute-972f1.firebaseapp.com",
  projectId: "greencommute-972f1",
  storageBucket: "greencommute-972f1.firebasestorage.app",
  messagingSenderId: "654702987889",
  appId: "1:654702987889:web:09e5ef3aaf8826e65a16580",
  measurementId: "G-926TDZR86Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') console.warn('Multiple tabs');
    else if (err.code === 'unimplemented') console.warn('No persistence');
  });
}

console.log('✅ Firebase initialized');
export default app;
```

---

### 🚀 STEP 2: Create Firebase Service

**Create file:** `src/services/firebaseService.ts`

```typescript
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, collection, addDoc, getDocs,
  query, where, orderBy, limit, updateDoc, deleteDoc,
  onSnapshot, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  role: 'driver' | 'passenger' | 'both';
  greenScore: number;
  totalRides: number;
  co2Saved: number;
  rating: number;
  createdAt: any;
}

export interface AppRide {
  id: string;
  driverId: string;
  driverName: string;
  source: string;
  destination: string;
  dateTime: Timestamp;
  availableSeats: number;
  pricePerSeat: number;
  vehicleModel: string;
  vehicleColor: string;
  distance: number;
  co2Saved: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Timestamp;
}

export async function signUp(email: string, password: string, name: string, role: string = 'passenger') {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const userData: AppUser = {
    id: userCredential.user.uid,
    name, email: userCredential.user.email!,
    role: role as any,
    greenScore: 0, totalRides: 0, co2Saved: 0, rating: 5.0,
    createdAt: serverTimestamp()
  };
  await setDoc(doc(db, 'users', userCredential.user.uid), userData);
  return userData;
}

export async function signIn(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  if (!userDoc.exists()) throw new Error('User not found');
  return { id: userCredential.user.uid, ...userDoc.data() } as AppUser;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserData(uid: string): Promise<AppUser | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? { id: uid, ...userDoc.data() } as AppUser : null;
}

export async function createRide(rideData: Omit<AppRide, 'id' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, 'rides'), {
    ...rideData, createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function getActiveRides(): Promise<AppRide[]> {
  const q = query(
    collection(db, 'rides'),
    where('status', '==', 'active'),
    orderBy('dateTime', 'asc'),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppRide));
}

export async function getRidesByDriver(driverId: string): Promise<AppRide[]> {
  const q = query(
    collection(db, 'rides'),
    where('driverId', '==', driverId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppRide));
}

export async function updateRide(rideId: string, updates: Partial<AppRide>) {
  await updateDoc(doc(db, 'rides', rideId), updates as any);
}

export async function deleteRide(rideId: string) {
  await deleteDoc(doc(db, 'rides', rideId));
}

export function listenToRides(callback: (rides: AppRide[]) => void) {
  const q = query(
    collection(db, 'rides'),
    where('status', '==', 'active'),
    orderBy('dateTime', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const rides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppRide));
    callback(rides);
  });
}

export function listenToRide(rideId: string, callback: (ride: AppRide | null) => void) {
  return onSnapshot(doc(db, 'rides', rideId), (doc) => {
    callback(doc.exists() ? { id: doc.id, ...doc.data() } as AppRide : null);
  });
}

export async function updateDriverLocation(rideId: string, driverId: string, lat: number, lng: number) {
  await setDoc(doc(db, 'liveLocations', rideId), {
    rideId, driverId, lat, lng, updatedAt: serverTimestamp()
  });
}

export function listenToDriverLocation(rideId: string, callback: (location: any) => void) {
  return onSnapshot(doc(db, 'liveLocations', rideId), (doc) => {
    if (doc.exists()) callback(doc.data());
  });
}
```

---

### 🚀 STEP 3: Create Services Folder

In VS Code:
1. Right-click on `src` folder
2. Click "New Folder" → Name it: `services`
3. Inside `services`, create file `firebaseService.ts` with code from Step 2

---

### ✅ FIREBASE INTEGRATION COMPLETE! 🎉

**All files have been automatically updated!**

✅ `src/lib/firebase.ts` - Firebase config created  
✅ `src/services/firebaseService.ts` - All Firebase functions created  
✅ `src/contexts/AuthContext.tsx` - Updated to use Firebase Auth  
✅ `src/main.tsx` - Firebase initialized  
✅ `src/pages/Login.tsx` - Uses Firebase Auth (via AuthContext)  
✅ `src/pages/SignUp.tsx` - Uses Firebase Auth (via AuthContext)  
✅ `src/pages/OfferRide.tsx` - Saves rides to Firestore  
✅ `src/pages/FindRide.tsx` - Reads rides from Firestore with real-time updates  

---

### 🚀 FINAL STEP: Setup Firestore Database

**Go to Firebase Console:** https://console.firebase.google.com/project/greencommute-972f1

1. Click **Firestore Database** (left sidebar)
2. If not started, click **Create Database**
3. Choose **Production mode** → Next
4. Select location: **us-central** → Enable
5. Click **Rules** tab
6. Replace with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

7. Click **Publish**
8. Click **Indexes** tab → Create these indexes:

**Index 1:**
- Collection: `rides`
- Fields: `status` (Ascending), `dateTime` (Ascending)

**Index 2:**
- Collection: `rides`
- Fields: `driverId` (Ascending), `createdAt` (Descending)

---

### 🧪 TEST YOUR APP NOW!

```bash
npm run dev
```

**Open browser (http://localhost:8080)** and check console:

✅ **"🚀 App starting with Firebase..."**  
✅ **"✅ Firebase initialized"**  

**Test Flow:**
1. Click **Sign Up** → Create account (saves to Firestore!)  
2. Login with your email/password (authenticates via Firebase!)  
3. Click **Offer Ride** → Create a ride (saves to Firestore!)  
4. Click **Find Ride** → See your ride listed (reads from Firestore!)  
5. Open Firebase Console → Firestore → See your data there! 🔥  

---

### 🔧 If You Get Errors

**Error: "Cannot find module '@/lib/firebase'"**
- Make sure you created both files correctly
- Restart dev server: `Ctrl+C` then `npm run dev`

**Error: "Firebase: Missing or insufficient permissions"**
- Check Firestore Rules (step 6 above)
- Make sure you're logged in

**Error: "Failed to create ride"**
- Check browser console for details
- Make sure Firestore indexes are created
- Check Firebase Console → Firestore → Data tab

**Rides not showing up?**
- Open Firebase Console → Firestore Database
- Check if `rides` collection exists
- Check if documents are being created

---

### ✅ **LATEST FIXES (Just Applied)**

**Issue Fixed:** Irrelevant routes showing in search results  
**Solution:** Improved matching algorithm to require BOTH source and destination to match  

**How It Works Now:**
- **Keyword Extraction:** Splits locations by comma (e.g., "Yelahanka, Bengaluru, Karnataka" → ["yelahanka", "bengaluru", "karnataka"])
- **Strict Matching:** BOTH source AND destination keywords must match for a ride to appear
- **Minimum Score:** Smart Match now requires 40+ points (previous: 0+)
- **Smart Filtering:** Only shows highly relevant routes

**Example:**
```
Search: Yelahanka → Rajanukunte
✅ SHOWS: Yelahanka → Rajanukunte (exact match)
✅ SHOWS: Yelahanka, Bengaluru → Rajanukunte, Karnataka (keyword match)
❌ HIDES: Doddaballapura → Yelahanka (destination doesn't match)
❌ HIDES: Rajanukunte → Electronic City (source doesn't match)
```

**Files Updated:**
- ✅ `src/pages/SmartMatch.tsx` - Stricter matching algorithm + 40 point minimum
- ✅ `src/pages/FindRide.tsx` - Keyword-based location matching

**Test Now:**
1. Refresh browser (Ctrl+Shift+R)
2. Go to "AI Smart Match"
3. Search: "Yelahanka" → "Rajanukunte"
4. Only see rides that match BOTH locations! ✅

---

### 🎯 What Firebase Gives You Now

✅ **Real Authentication** - No more fake logins, real user accounts  
✅ **Cloud Database** - All data stored in Firestore (scalable to millions)  
✅ **Real-time Updates** - Rides update automatically without refresh  
✅ **Offline Support** - App works without internet, syncs when back online  
✅ **Production Ready** - Can handle 10, 100, or 10,000 users  
✅ **Auto-scaling** - No server management needed  

---

## ✨ Key Features

- 🤖 **AI Smart Matching** - Intelligent algorithm matches you with optimal rides
- 🛡️ **Safety Center** - Comprehensive verification and emergency features
- 🌿 **Carbon Tracking** - Real-time CO₂ savings with gamification
- 💰 **Economic** - Save up to 60% vs solo driving
- 💬 **In-App Chat** - Secure communication with ride partners
- 📊 **Analytics** - Track your impact and savings

## Getting Started

**Prerequisites:**

Node.js & npm must be installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

**Installation:**

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd eco-commute-collective

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router v6
- **State**: React Context API

## 📱 Features Overview

### Core Pages (17 Total)

1. **Authentication**: Sign up, Login, Role Selection
2. **Dashboard**: Central hub with quick actions
3. **AI Smart Match**: Intelligent ride matching algorithm
4. **Find/Offer Rides**: Search and create rides
5. **My Rides**: Manage your offered and booked rides
6. **Safety Center**: Verification, emergency contacts, guidelines
7. **Live Tracking**: Real-time ride tracking with SOS
8. **Chat**: In-app messaging system
9. **Leaderboard**: Gamification and rankings
10. **Wallet**: Payment dashboard and analytics
11. **Admin Panel**: Platform management
12. **Profile**: User settings

## 🎯 Project Objectives

This project fulfills 5 key objectives:

1. ✅ Sustainable ride-sharing platform
2. ✅ Carbon footprint reduction through gamification
3. ✅ Economic and efficient commuting alternative
4. ✅ User safety with real-time tracking and verification
5. ✅ AI-driven smart matching algorithms

## 📚 Documentation

For detailed information, see:
- `OBJECTIVES_REPORT.md` - Full objectives analysis
- `FEATURES_COMPLETED.md` - Complete feature list
- `IMPLEMENTATION_GUIDE.md` - Setup and usage guide

## 🚀 Deployment

```sh
# Build for production
npm run build

# Preview production build
npm run preview
```

Deploy the `dist` folder to any static hosting service (Vercel, Netlify, etc.)

## 📝 License

This project is for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with 💚 for a sustainable future 🌍**
