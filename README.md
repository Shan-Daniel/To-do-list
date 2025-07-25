# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

video link- https://drive.google.com/drive/folders/1TwVWKY_5cXOfOLN1q8J_5sAdB82qPhJw
Explanation:

Architecture Breakdown
1. Frontend: React Native
Framework: React Native

State Management: Context API, Redux, or Zustand

Navigation: React Navigation

Animations: Reanimated or LayoutAnimation

UI Kit: React Native Paper or NativeBase

2. Backend: Firebase
Authentication: Firebase Auth (with Google Sign-In)

Database: Firebase Firestore

Offline Support: Built-in with Firestore caching

Crash Reporting: Firebase Crashlytics

Hosting (Optional): If you build a web version with React

Onboarding & Authentication
Use Firebase Auth with the provider of your choice (e.g., Google)

Package: expo-auth-session (if using Expo) or react-native-google-signin

Steps:

Trigger sign-in via Google.

Authenticate user using the token with Firebase.

Save basic user data (uid, displayName, email, etc.)

Handle login errors and edge cases (e.g., cancelled login, network issues).

Task Management (CRUD)
Tasks stored in Firestore under each user’s document (e.g., /users/{uid}/tasks)

Fields: title, description, dueDate, status (open/complete), priority

Use Firestore's real-time updates or manual get() + onSnapshot() methods

Store local copy in app state for faster UI interactions and offline fallback

User Experience (UX)
Tabs: Use React Navigation with Tab.Navigator

Filters: Filter tasks by status, due date, priority

Search: Implement TextInput to filter tasks by title

FAB: Use React Native Paper or custom TouchableOpacity to trigger task creation

No Data States: Show illustrations/text when task list is empty

Animations: Use LayoutAnimation or Reanimated for smooth transitions

Future Improvements
Add notifications for due tasks (using Firebase Cloud Messaging)

Add priority badges and color coding

Sync tasks to calendar

Multiple task lists or categories

Web version (React or Flutter Web)

Diagram:
https://drive.google.com/drive/folders/1U17jV3A7O1WkcyCpsf2XfUtdJHT8M0pV


“This project is a part of a hackathon run by
https://www.katomaran.com ”
