// EmployeeSearch.jsx
import React from 'react';
import "./EmployeeSearch.css";

const EmployeeSearch = ({
  employeeSearch,
  searchResults,
  searchLoading,
  selectedEmployee,
  onSearchChange,
  onEditEmployee,
  onDeleteEmployee,
  getImageUrl,
  isAdmin
}) => {
  // Don't render if not admin
  if (!isAdmin) return null;

  return (
    <div className="employee-search-section">
      <h3 className="section-title">
        <span>👥</span>
        Employee Management
      </h3>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search employees by name, email, department..."
            value={employeeSearch}
            onChange={onSearchChange}
            className="search-input"
          />
          {searchLoading && <div className="search-spinner"></div>}
        </div>
      </div>

      {/* Search Results Table */}
      {searchResults.length > 0 && (
        <div className="search-results">
          <div className="results-header">
            <h4 className="results-title">
              📊 Found {searchResults.length} employee(s)
            </h4>
          </div>

          <div className="table-container">
            <table className="employee-table">
              <thead>
                <tr className="table-header">
                  <th className="table-header-cell">Photo</th>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Email</th>
                  <th className="table-header-cell">Department</th>
                  <th className="table-header-cell">Role</th>
                  <th className="table-header-cell">Phone</th>
                  <th className="table-header-cell">Age</th>
                  <th className="table-header-cell">Gender</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((employee, index) => (
                  <tr
                    key={employee.id}
                    className={`table-row ${
                      index % 2 === 0 ? 'table-row-even' : 'table-row-odd'
                    }`}
                  >
                    <td className="table-cell">
                      <img
                        src={getImageUrl(employee.profile_pic_url)}
                        alt="Profile"
                        className="table-avatar"
                        onError={(e) => {
                          e.target.src = "https://res.cloudinary.com/dpplrxoko/image/upload/v1750463195/panda_upyqmw.jpg";
                        }}
                      />
                    </td>
                    <td className="table-cell">
                      <div className="name-cell">
                        <span className="employee-full-name">
                          {employee.first_name} {employee.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="email-text">
                        {employee.email_id}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="department-badge">
                        {employee.department || "N/A"}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="role-text">{employee.role || "N/A"}</span>
                    </td>
                    <td className="table-cell">
                      <span className="phone-text">
                        {employee.phone_number || "N/A"}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="age-text">{employee.age || "N/A"}</span>
                    </td>
                    <td className="table-cell">
                      <span className="gender-text">
                        {employee.gender || "N/A"}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="action-buttons">
                        <button
                          className="btn-edit-table"
                          onClick={() => onEditEmployee(employee)}
                          title="Edit Employee"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete-table"
                          onClick={() => onDeleteEmployee(employee)}
                          title="Delete Employee"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results */}
      {employeeSearch && !searchLoading && searchResults.length === 0 && (
        <div className="no-results">
          <span className="no-results-icon">😔</span>
          <p className="no-results-text">
            No employees found matching "{employeeSearch}"
          </p>
        </div>
      )}

      {/* Search Instructions */}
      {!employeeSearch && (
        <div className="search-instructions">
          <div className="instruction-card">
            <span className="instruction-icon">💡</span>
            <h4>Search Tips</h4>
            <ul>
              <li>Search by employee name, email, or department</li>
              <li>Results appear as you type</li>
              <li>Click edit (✏️) to modify employee details</li>
              <li>Click delete (🗑️) to remove an employee</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSearch;