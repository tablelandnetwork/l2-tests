// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


contract TableEvents {
   event DataStored(string indexed table, string val);
   function storeData(string memory _table, string memory _val) public {
         emit DataStored(_table, _val);
  }
}