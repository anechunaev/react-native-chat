import { initializeApp, type FirebaseApp } from "firebase/app";
import {
	addDoc,
	arrayRemove,
	arrayUnion,
	collection as collectionRef,
	query as dbQuery,
	doc,
	endBefore,
	getDoc,
	getDocs,
	getFirestore,
	limitToLast,
	onSnapshot as onDBSnapshot,
	orderBy,
	setDoc,
	updateDoc,
	type Firestore
} from "firebase/firestore";
import firebaseConfig from "../secrets/firebase.json" with { type: "json" };

export { arrayRemove, arrayUnion };

export const ROOT_COLLECTION = "com.nechunaev.testapp";
export const ONLINE_STATUS_DOC = [ROOT_COLLECTION, "statuses"];

export type QueryParams = {
	collection: string;
	collectionSegments: string[];
	orderField: string;
	orderDirection: "asc" | "desc";
	limit: number;
	cursorRefs: unknown[];
};
const DEFAULT_QUERY: QueryParams = {
	collection: ROOT_COLLECTION,
	collectionSegments: [],
	orderField: "sent_date",
	orderDirection: "asc",
	limit: 25,
	cursorRefs: [],
};

export type DocumentData = Record<string, unknown> & { id?: string };

export type Message = {
	id: string;
	text: string;
	user: string;
	sent_date: string;
	delivery_status: string;
	reactions: Record<string, unknown>;
};

export default class DatabaseService {
	private firebaseApp: FirebaseApp;
	private firestore: Firestore;

	constructor() {
		this.firebaseApp = initializeApp(firebaseConfig);
		this.firestore = getFirestore(this.firebaseApp);
	}

	public async addToCollection(data: DocumentData, query: Partial<QueryParams>): Promise<string> {
		const { collection, collectionSegments } = Object.assign({}, DEFAULT_QUERY, query);
		const docRef = await addDoc(
			collectionRef(this.firestore, collection, ...collectionSegments),
			data,
		);
		return docRef.id;
	}

	public async getFromCollection(query: Partial<QueryParams>): Promise<DocumentData[] | null> {
		const {
			orderField,
			orderDirection,
			limit,
			cursorRefs,
			collection,
			collectionSegments,
		} = Object.assign({}, DEFAULT_QUERY, query);
		const snapshotRef = collectionRef(this.firestore, collection, ...collectionSegments);

		const constraints: any[] = [
			orderBy(orderField, orderDirection),
			limitToLast(limit),
		];
		if (cursorRefs.length > 0) {
			constraints.push(endBefore(...cursorRefs));
		}
		const q = dbQuery(snapshotRef, ...constraints);
		const snapshot = await getDocs(q);

		console.log('>> Requested:', snapshot.size);

		if (snapshot.empty) {
			return null;
		}
		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
	}

	public async getDocument(documentPath: string[]): Promise<DocumentData | null> {
		const [first, ...rest] = documentPath;
		const docRef = doc(this.firestore, first, ...rest);
		const snapshot = await getDoc(docRef);
		if (!snapshot.exists()) {
			return null;
		}
		return { id: snapshot.id, ...snapshot.data() };
	}

	public async updateDocument(documentPath: string[], data: Record<string, unknown>): Promise<void> {
		const [first, ...rest] = documentPath;
		const docRef = doc(this.firestore, first, ...rest);
		await updateDoc(docRef, data);
	}

	public async setDocument(documentPath: string[], data: Record<string, unknown>): Promise<void> {
		const [first, ...rest] = documentPath;
		const docRef = doc(this.firestore, first, ...rest);
		await setDoc(docRef, data, { merge: true });
	}

	public subscribeToDocument(
		documentPath: string[],
		onSnapshot: (data: DocumentData | null) => void,
		onError?: (error: unknown) => void,
	): () => void {
		const [first, ...rest] = documentPath;
		const docRef = doc(this.firestore, first, ...rest);
		return onDBSnapshot(
			docRef,
			(snapshot) => {
				onSnapshot(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
			},
			(error) => {
				onError?.(error);
			},
		);
	}

	public subscribeToCollection(
		query: Partial<QueryParams>,
		onSnapshot: (data: DocumentData[]) => void,
		onError?: (error: unknown) => void,
	): () => void {
		const {
			orderField,
			orderDirection,
			limit,
			collection,
			collectionSegments,
		} = Object.assign({}, DEFAULT_QUERY, query);

		const snapshotRef = collectionRef(
			this.firestore,
			collection,
			...collectionSegments,
		);
		const q = dbQuery(
			snapshotRef,
			orderBy(orderField, orderDirection),
			limitToLast(limit),
		);

		return onDBSnapshot(q, (snapshot) => {
			const data = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			onSnapshot(data);
		}, (error) => {
			onError?.(error);
		});
	}
}
