function CandidateCard({ candidate, onClick }) {
  if (!candidate) return null;

  const {
    candidate_id,
    name,
    surname,
    patronymic,
    position,
    city_name,
    employment_type_name,
    expected_salary,
    candidate_email,
    phone_number,
    sex,
  } = candidate;

  const fullName = [surname, name, patronymic].filter(Boolean).join(" ");
  const salaryText =
    expected_salary && Number(expected_salary) > 0
      ? `${Number(expected_salary).toLocaleString("uk-UA")} грн`
      : "за домовленістю";

  const sexLabel =
    sex?.toLowerCase() === "male"
      ? "Чоловік "
      : sex?.toLowerCase() === "female"
      ? "Жінка "
      : null;


  function getEmploymentBadgeColor(type) {
    if (!type) return "bg-gray-400";

    const t = type.toLowerCase();

    if (t.includes("full")) return "bg-green-400";
    if (t.includes("part")) return "bg-yellow-400";
    if (t.includes("remote")) return "bg-blue-400";

    return "bg-gray-400"; 
  }
  return (
    <article
      className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex flex-col gap-2 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {position}
          </h3>
          {fullName && (
            <p className="text-sm text-gray-700">{fullName}</p>
          )}
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1">
          {sexLabel && (
            <span
              className={
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white " +
                (sex?.toLowerCase() === "male"
                  ? "bg-blue-400"
                  : "bg-pink-400")
              }
            >
              {sexLabel}
            </span>
          )}

          <p className="text-m text-gray-800">
            Очікувана зарплата:{" "}
            <span className="font-semibold">{salaryText}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mt-1">
        {city_name && (
          <span>📍 {city_name}</span>
        )}
        {employment_type_name && (
          <span
            className={
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white " +
              getEmploymentBadgeColor(employment_type_name)
            }
          >
            {employment_type_name}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm text-gray-700">
        <div className="flex flex-col">
          <span>
            📧{" "}
            <span className="text-blue-700">
              {candidate_email}
            </span>
          </span>
          {phone_number && (
            <span>📞 {phone_number}</span>
          )}
        </div>

        <div className="mt-2 sm:mt-0 flex gap-2">

        </div>
      </div>
    </article>
  );
}

export default CandidateCard;
