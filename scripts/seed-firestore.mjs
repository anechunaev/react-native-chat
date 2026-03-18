import { initializeApp } from "firebase/app";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { readFileSync } from "node:fs";

const firebaseConfig = JSON.parse(
	readFileSync("./secrets/firebase.json", "utf-8"),
);
const messages = JSON.parse(
	readFileSync("./scripts/data.mock.json", "utf-8"),
);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ROOM_PATH = "com.nechunaev.testapp/chats/rooms/default";

// Create statuses document
await setDoc(doc(db, "com.nechunaev.testapp/statuses"), { online: [] });
console.log("Created statuses document: com.nechunaev.testapp/statuses");

// Create room document
await setDoc(doc(db, ROOM_PATH), { typing: [] });
console.log(`Created room document: ${ROOM_PATH}`);

// Seed messages
const writes = messages.map(({ id, ...fields }) =>
	setDoc(doc(db, `${ROOM_PATH}/messages`, id), fields),
);

await Promise.all(writes);
console.log(`Seeded ${messages.length} messages`);

process.exit(0);
