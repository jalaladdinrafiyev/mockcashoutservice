// Mock database for accounts
const accounts = {
	ACC001: { id: 'ACC001', balance: 1500.0, status: 'active', name: 'John Doe' },
	ACC002: { id: 'ACC002', balance: 2750.5, status: 'active', name: 'Jane Smith' },
	ACC003: { id: 'ACC003', balance: 100.25, status: 'active', name: 'Bob Johnson' },
	ACC004: { id: 'ACC004', balance: 0.0, status: 'frozen', name: 'Alice Brown' },
	ACC005: { id: 'ACC005', balance: 5000.0, status: 'active', name: 'Charlie Wilson' }
};

class AccountModel {
	static findById(id) {
		return accounts[id];
	}

	static updateBalance(id, newBalance) {
		if (accounts[id]) {
			accounts[id].balance = newBalance;
			return true;
		}
		return false;
	}
}

module.exports = AccountModel;
