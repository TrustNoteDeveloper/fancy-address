WALLET_INDEX_DEPTHS = 3
WALLET_ADDRESS_DEPTHS = 30
matchCnt = 0

    async function generateMnemonicAndAddress(userCustomerParameters) {

        matchCnt = 0

        document.getElementById('btn_start').disabled = true


        if (userCustomerParameters.matched_words.length == 0) {
            appendResultList("Empty customer input")
        }

        //appendResultList("Search following word from address: " + userCustomerParameters.matched_words.join(","))
        //appendResultList("Total mnemonic will be genereated: " + userCustomerParameters.total_mnemonics)

        i = 0
        while (userCustomerParameters.matched_words.length>=matchCnt) {

            updateProgress_making(++i, userCustomerParameters.total_mnemonics)

            var mnemonic = Client.mnemonic();
            var privkey = Client.xPrivKey(mnemonic);

            for(walletIndex = 0; walletIndex < WALLET_INDEX_DEPTHS; walletIndex++) {
                var walletPubkey = Client.walletPubKey(privkey, walletIndex)
                checkAddressByWalletPubkey(mnemonic, walletIndex, walletPubkey, userCustomerParameters)
            }

            await sleep(50);

            if (matchCnt >= userCustomerParameters.total_mnemonics) {
                break
            } 

        }
        document.getElementById('btn_start').disabled = false


    }

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    function checkAddressByWalletPubkey(mnemonic, walletIndex, walletPubkey, userCustomerParameters) {

        for(var i = 0; i < WALLET_ADDRESS_DEPTHS; i++) {
            var address = Client.walletAddress(walletPubkey, 0, i)
            if (isVanityAddress(address, userCustomerParameters)) {
                showVanityAddress(mnemonic, walletIndex, i, address)
            }
        }
    }

    function isVanityAddress(address, userCustomerParameters) {
        for(index in userCustomerParameters.matched_words) {
            var isMatch = address.startsWith(userCustomerParameters.matched_words[index])
            if (isMatch) {
                matchCnt+=1;
                updateProgress_state();
                return true
            }
        }
    }

    function showVanityAddress(mnemonic, walletIndex, addressIndex, address) {

        appendResultList("地址：" + address + "<br/>" + "助记词：" + mnemonic + ":::钱包序号：" + walletIndex + ":::地址序号：" + addressIndex)

    }

    function appendResultList(resultItem) {

          var ul = document.getElementById("result_list");
          var li = document.createElement("li");
          li.appendChild(document.createTextNode(resultItem));
          li.innerHTML=resultItem;
          ul.appendChild(li);

    }

    function updateProgress_making(i, totalMnemonic) {
        document.getElementById('progress_percent_making').innerHTML = "正在生成 :" + i;
    }

    function updateProgress_state() {
        document.getElementById('progress_percent_state').innerHTML = "找到满足条件的地址：" + matchCnt + "个";
    }



    function readUserInputParameter() {

        var userCustomerParameters = {}
        var userInputWords = document.getElementById('user_customer_matched_words').value
        userCustomerParameters.matched_words = parserUserInputWordList(userInputWords)
        userCustomerParameters.total_mnemonics = document.getElementById('user_customer_total_mnemonics').value

        return userCustomerParameters

    }


    function parserUserInputWordList(sentence) {
        return sentence.trim().toUpperCase().split(/[ ,]+/).filter(word => word.length > 0)
    }