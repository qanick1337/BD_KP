function UserCard({ user, onClick, onClickBtn }) {
  const fullName = [user.name, user.surname, user.patronymic]
    .filter(Boolean)
    .join(" ");

  const vacanciesText = "немає розміщених вакансій";

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:shadow-md transition"
    >
      <div>
        <p className="text-lg font-semibold text-gray-900">
          {fullName || user.user_email}{" "}
          <span className="text-sm font-normal text-gray-500">
            {vacanciesText}
          </span>
        </p>

        <p className="text-sm text-gray-600 mt-1">{user.user_email}</p>


      </div>

      <button
        className="bg-red-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-md mt-2 sm:mt-0"
        onClick={(e) => {
          e.stopPropagation();  
          (onClickBtn())
        }}
      >
        Видалити
      </button>
    </div>
  );
}

export default UserCard;
