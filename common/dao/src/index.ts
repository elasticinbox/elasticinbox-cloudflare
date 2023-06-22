import DAOFactory from "./DAOFactory";

export default class Main {
    public static main(): void {
        const messageDAO = DAOFactory.getMessageDAO(DAOFactory.CLOUDFLARE_KV)
        console.log(messageDAO.name)
    }
}
