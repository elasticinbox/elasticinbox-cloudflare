import Base from "./Base.model";

/**
 * Representation of a MIME part which is referenced from and belongs to a
 * MIME Message.
 */
class MimePart extends Base {
	/** 
	 * Multipart and nested multipart messages are assigned consecutive part numbers,
	 * as they occur in the message as per the IMAP4 specification (e.g. "2" or "3.1").
	 */
	id!: string;

	size?: number;
	filename?: string;
	mimeType?: string;
	contentId?: string;
	disposition!: "attachment" | "inline" | null;
	content?: string;

	public constructor(id: string, init?: Partial<MimePart>) {
		super();
		this.contentId = init?.contentId;
		this.mimeType = init?.mimeType;
		this.disposition = init?.disposition || null;
		this.filename = init?.filename;
		this.size = init?.content?.length || 0;
		this.content = init?.content;
	}
};

export default MimePart;