
export class Message {
    message: string
}

export class WarningMessage extends Message {

}

export class ErrorMessage extends WarningMessage {

}