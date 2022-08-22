import { BigInt, Bytes, store } from "@graphprotocol/graph-ts"
import { Transfer, MonokeeERC721 } from "../generated/MonokeeERC721/MonokeeERC721"
import { Token, TokenContract, Owner } from '../generated/schema';


let ZERO_ADDRESS_STRING = '0x0000000000000000000000000000000000000000';

let ZERO_ADDRESS: Bytes = Bytes.fromHexString(ZERO_ADDRESS_STRING) as Bytes;
let ZERO = BigInt.fromI32(0);
let ONE = BigInt.fromI32(1);

function setCharAt(str: string, index: i32, char: string): string {
    if(index > str.length-1) return str;
    return str.substr(0,index) + char + str.substr(index+1);
}

function normalize(strValue: string): string {
    if (strValue.length === 1 && strValue.charCodeAt(0) === 0) {
        return "";    
    } else {
        for (let i = 0; i < strValue.length; i++) {
            if (strValue.charCodeAt(i) === 0) {
                strValue = setCharAt(strValue, i, '\ufffd'); // graph-node db does not support string with '\u0000'
            }
        }
        return strValue;
    }
}

export function handleTransfer(event: Transfer): void {
    let tokenId = event.params.tokenId;
    let id = event.address.toHex() + '_' + tokenId.toString();
    let contractId = event.address.toHex();
    let from = event.params.from.toHex();
    let to = event.params.to.toHex();
    
    let contract = MonokeeERC721.bind(event.address);
    let tokenContract = TokenContract.load(contractId);
    if(tokenContract == null) {
        
        tokenContract = new TokenContract(contractId);
        tokenContract.supportsEIP721Metadata = true;
        tokenContract.numTokens = ZERO;
        tokenContract.numOwners = ZERO;
        let name = contract.try_name();
        if(!name.reverted) {
            tokenContract.name = normalize(name.value);
        }
        let symbol = contract.try_symbol();
        if(!symbol.reverted) {
            tokenContract.symbol = normalize(symbol.value);
        }
        
    }

    if (from != ZERO_ADDRESS_STRING || to != ZERO_ADDRESS_STRING) { // skip if from zero to zero

        if (from != ZERO_ADDRESS_STRING) { // existing token
            Owner.load(from);
        } // else minting
        
        if(to != ZERO_ADDRESS_STRING) { // transfer
            let newOwner = Owner.load(to);
            if (newOwner == null) {
                newOwner = new Owner(to);
                newOwner.numTokens = ZERO;
            }

            let MonokeeERC721Token = Token.load(id);
            if(MonokeeERC721Token == null) {
                MonokeeERC721Token = new Token(id);
                MonokeeERC721Token.contract = tokenContract.id;
                MonokeeERC721Token.tokenID = tokenId;
                MonokeeERC721Token.mintTime = event.block.timestamp;
                if (tokenContract.supportsEIP721Metadata) {
                    let metadataURI = contract.try_tokenURI(tokenId);
                    if(!metadataURI.reverted) {
                        MonokeeERC721Token.tokenURI = normalize(metadataURI.value);
                    } else {
                        MonokeeERC721Token.tokenURI = "";
                    }
                } else {
                    MonokeeERC721Token.tokenURI = "";
                }
            }
            
            if (from == ZERO_ADDRESS_STRING) { // mint +1
                tokenContract.numTokens = tokenContract.numTokens.plus(ONE);
            }
            
            MonokeeERC721Token.owner = newOwner.id;
            MonokeeERC721Token.save();

            newOwner.numTokens = newOwner.numTokens.plus(ONE);
            newOwner.save();

        } else { // burn
            store.remove('Token', id);
            tokenContract.numTokens = tokenContract.numTokens.minus(ONE);
        }
    }
    tokenContract.save();
}