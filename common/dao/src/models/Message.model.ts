import Base from './Base.model';
import MimePart from './MimePart.model';

export enum Marker {
    Seen = 1,
    Replied = 2,
    Forwarded = 3
}

export enum ReservedLabel {
    All = 0,
    Inbox = 1,
    Drafts = 2,
    Sent = 3,
    Trash = 4,
    Spam = 5,
    Important = 6,
    Starred = 7,
    Attachments = 8,
    Snoozed = 9,
    Reserved = 10,
}

export class Address {
	public address!: string;
	public name?: string;

	constructor (address: string, name?: string) {
		this.address = address;
		this.name = name;
	}
}

class Message extends Base {
	public from?: Address;
	public sender?: Address;
	public replyTo?: Address[];
	public returnPath?: string;
	public to?: Address[];
	public cc?: Address[];
	public bcc?: Address[];
	public subject?: string;
	public messageId?: string;
	public inReplyTo?: string;
	public references?: string;
	public date?: string;
	public html?: string;
	public text?: string;

    public parts?: Map<string, MimePart>;

    public labels: Set<number> = new Set();
    public markers: Set<Marker> = new Set();
    public blobURL?: URL;
    public size?: number;

	public constructor(id: string, init?: Partial<Message>) {
		super();
		this.id = id;
		this.from = init?.from
		this.sender = init?.sender
		this.replyTo = init?.replyTo
		this.returnPath = init?.returnPath
		this.to = init?.to
		this.cc = init?.cc
		this.bcc = init?.bcc
		this.subject = init?.subject
		this.messageId = init?.messageId
		this.inReplyTo = init?.inReplyTo
		this.references = init?.references
		this.date = init?.date
		this.html = init?.html
		this.text = init?.text
		this.labels = init?.labels || new Set<number>();
		this.markers = init?.markers || new Set<Marker>();
		this.blobURL = init?.blobURL;
		this.size = init?.size;
		this.parts = init?.parts;
    }
};

export default Message;