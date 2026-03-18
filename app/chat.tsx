import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity } from "react-native";
import Bubble from "../components/Bubble";
import MessageForm from '../components/MessageForm';
import TypingIndicator from '../components/TypingIndicator';
import { useStatus } from "../hooks/useStatus";
import { useServices } from "../services/context";
import type { Message } from "../services/database";
import { STYLES as THEME_STYLES } from "../theme";

const PAGE_SIZE = 25;
const ROOM_ID = "default";
const MSG_DOC_SEGMENTS = ["chats", "rooms", ROOM_ID, "messages"];

export default function Chat() {
	const { db, auth, setIsLoggedInGuard: setIsLoggedIn } = useServices();
	const { onlineUsers, typingUsers, notifyTyping, clearTyping } = useStatus(ROOM_ID);
	const [oldMessages, setOldMessages] = useState<Message[] | null>(null);
	const [liveFeed, setLiveFeed] = useState<Message[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
	const [inputText, setInputText] = useState<string>("");

	const cursorRef = useRef<string | null>(null);

	useEffect(() => {
		const unsubscribe = db.subscribeToCollection(
			{ collectionSegments: MSG_DOC_SEGMENTS },
			(data) => {
				const messages = data as Message[];
				if (messages.length > 0) {
					cursorRef.current = messages[0].sent_date;
				}
				if (messages.length < PAGE_SIZE) {
					setHasMore(false);
				}
				setLiveFeed(messages);
			},
			(err) => {
				setError(`Subscription error: ${err}`);
			},
		);

		return unsubscribe;
	}, [db]);

	const loadMoreMessages = useCallback(async () => {
		if (isLoadingMore || !hasMore || !cursorRef.current) return;

		setIsLoadingMore(true);
		try {
			const messages = await db.getFromCollection({
				collectionSegments: MSG_DOC_SEGMENTS,
				cursorRefs: [cursorRef.current],
			}) as Message[] | null;

			if (!messages) {
				setHasMore(false);
				return;
			}

			cursorRef.current = messages[0].sent_date;

			if (messages.length < PAGE_SIZE) {
				setHasMore(false);
			}

			setOldMessages(prev => {
				if (!prev) return messages;
				return [...messages, ...prev];
			});
		} catch (err) {
			setError(`Failed to load more messages: ${err}`);
		} finally {
			setIsLoadingMore(false);
		}
	}, [db, isLoadingMore, hasMore]);

	const handleLogout = async () => {
		clearTyping();
		await auth.logOut();
		setIsLoggedIn(false);
	};

	const handleTextChange = useCallback((text: string) => {
		setInputText(text);
		if (text.trim().length > 0) {
			notifyTyping();
		}
	}, [notifyTyping]);

	const sendMessage = useCallback(async () => {
		const text = inputText.trim();
		if (!text) return;
		setInputText('');
		clearTyping();
		try {
			await db.addToCollection({
				delivery_status: "sent",
				reactions: {},
				sent_date: new Date().toISOString(),
				text,
				user: auth.getUserName(),
			}, {
				collectionSegments: MSG_DOC_SEGMENTS,
			});
		} catch (err) {
			setError(`Failed to send message: ${err}`);
		}
	}, [db, auth, inputText, clearTyping]);

	const displayMessages = useMemo(() => {
		if (!liveFeed) return [];
		const liveIds = new Set(liveFeed.map(m => m.id));
		const reversed = liveFeed.slice().reverse();
		if (oldMessages) {
			const uniqueOld = oldMessages.filter(m => !liveIds.has(m.id)).reverse();
			return [...reversed, ...uniqueOld];
		}
		return reversed;
	}, [liveFeed, oldMessages]);

	const keyExtractor = useCallback((msg: Message) => msg.id ?? msg.sent_date ?? String(Math.random()), []);

	const renderMessage = useCallback(({ item }: { item: Message }) => (
		<Bubble
			name={item.user}
			text={item.text}
			timestamp={item.sent_date}
			status={item.delivery_status}
			isMe={item.user === auth.getUserName()}
			isOnline={onlineUsers.includes(item.user)}
		/>
	), [auth, onlineUsers]);

	return (
		<>
			<Stack.Screen
				options={{
					title: 'Chat',
					headerLeft: () => (
						<TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
							<MaterialCommunityIcons name="logout" size={24} />
						</TouchableOpacity>
					),
				}}
			/>
			<KeyboardAvoidingView
				style={THEME_STYLES.container}
				behavior="padding"
				keyboardVerticalOffset={110}
			>
				{error ? (
					<Text style={[THEME_STYLES.errorText, styles.errorText]}>{error}</Text>
				) : liveFeed === null ? (
					<ActivityIndicator size="large" style={styles.loader} />
				) : (
					<FlatList
						style={styles.messageList}
						data={displayMessages}
						inverted
						maintainVisibleContentPosition={{ minIndexForVisible: 1, autoscrollToTopThreshold: 100 }}
						removeClippedSubviews={false}
						keyExtractor={keyExtractor}
						renderItem={renderMessage}
						onEndReached={loadMoreMessages}
						onEndReachedThreshold={0.3}
						contentContainerStyle={styles.messageListContent}
					/>
				)}

				{typingUsers.length > 0 && (
					<TypingIndicator users={typingUsers} />
				)}

				<MessageForm
					defaultText={inputText}
					onChange={handleTextChange}
					onSubmit={sendMessage}
				/>
			</KeyboardAvoidingView>
		</>
	);
}

const styles = StyleSheet.create({
	loader: {
		flex: 1,
	},
	errorText: {
		flex: 1,
		textAlign: "center",
		marginTop: 40,
		paddingHorizontal: 20,
	},
	messageList: {
		flex: 1,
		width: "100%",
	},
	messageListContent: {
		alignItems: 'stretch',
		flexGrow: 1,
	},
	logoutButton: {
		marginRight: 10,
	},
});
