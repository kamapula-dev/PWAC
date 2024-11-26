import { useState } from "react";
import MonsterSelect from "../../../shared/elements/Select/MonsterSelect";
import { Form } from "antd";
import MonsterInput from "../../../shared/elements/MonsterInput/MonsterInput";

const DomainOption = () => {
  const [currentTab, setCurrentTab] = useState("buyDomain");

  const domains = [
    { value: "plinkoxy.store", label: "plinkoxy.store" },
    { value: "plinkoxy.com", label: "plinkoxy.com" },
    { value: "plinkoxy.net", label: "plinkoxy.net" },
  ];

  const [form] = Form.useForm();

  return (
    <div className="bg-[#20223B] min-h-[587px] rounded-lg px-[50px] pt-[62px] mb-4">
      <h2 className="text-[22px] leading-[26px] text-white mb-[30px]">Домен</h2>
      <div className="text-[18px] text-white leading-4 mb-[30px]">
        Для работы PWA необходим домен. Вы можете купить домен у нас или
        использовать свой.
      </div>
      <div className="flex gap-[30px] mb-[50px]">
        <div
          onClick={() => setCurrentTab("buyDomain")}
          className={`w-[460px] h-[178px] ${
            currentTab === "buyDomain" ? "bg-[#515ACA]" : "bg-[#20223B]"
          } border border-[#121320] rounded-lg  cursor-pointer p-[40px] ${
            currentTab !== "buyDomain" ? "hover:border-white" : ""
          }`}
        >
          <div className="text-white text-[16px] leading-[18px] mb-2">
            Купить готовый домен
          </div>
          <div className="font-bold text-white text-[22px]">$5</div>
        </div>
        <div
          onClick={() => setCurrentTab("ownDomain")}
          className={`w-[460px] h-[178px] ${
            currentTab === "ownDomain" ? "bg-[#515ACA]" : "bg-[#20223B]"
          } border border-[#121320] rounded-lg  cursor-pointer p-[40px] ${
            currentTab !== "ownDomain" ? "hover:border-white" : ""
          }`}
        >
          <div className="text-white text-[16px] leading-[18px] mb-2">
            Использовать свой
          </div>
          <div className="font-bold text-white text-[22px]">Бесплатно</div>
        </div>
      </div>
      {currentTab === "buyDomain" && (
        <div>
          <div className="text-white font-bold text-[16px] leading-[18px] mb-[10px]">
            Выберите понравившийся домен
          </div>
          <div className="text-gray-400 text-[16px] leading-[18px] mb-[20px]">
            Все домены уже настроены и работают. Ничего дополнительно
            настраивать не нужно.
          </div>
          <div className="flex justify-between">
            <MonsterSelect
              options={domains}
              defaultValue={domains[0]}
              className="w-[460px]"
              placeholder="Домен"
            />
            <div className="flex gap-[30px]">
              <button className="bg-[#383B66] hover:bg-[#515ACA] text-white rounded-lg text-base py-3 px-[38px]">
                Купить домен
              </button>
              <button className="bg-white hover:bg-[#00FF11] text-[#121320] rounded-lg text-base py-3 px-[38px]">
                Сохранить и продолжить
              </button>
            </div>
          </div>
        </div>
      )}
      {currentTab === "ownDomain" && (
        <div className="flex gap-[30px]">
          <div className="w-[460px]">
            <div className="font-bold text-white text-base mb-[15px]">
              (1) Подключение своего домена
            </div>
            <div className="font-normal text-gray-400 w-[355px] mb-[30px]">
              Для того, чтобы использовать собственный домен, нужно передать
              управление DNS записями в Cloudflare. Инструкция
              <span className="underline cursor-pointer">здесь</span>.
            </div>
            <Form form={form} className="mb-[57px]">
              <Form.Item name="domain" className="mb-[25px]">
                <MonsterInput
                  placeholder="Домен"
                  className="!bg-[#161724]"
                  autoComplete="off"
                />
              </Form.Item>
              <Form.Item name="CloudflareEmail" className="mb-[25px]">
                <MonsterInput
                  placeholder="Cloudflare Email"
                  className="!bg-[#161724]"
                  autoComplete="off"
                />
              </Form.Item>
              <Form.Item name="CloudflareAPI" className="mb-[25px]">
                <MonsterInput
                  placeholder="Cloudflare API Key"
                  className="!bg-[#161724]"
                  autoComplete="off"
                />
              </Form.Item>
            </Form>
          </div>
          <div className="w-[460px]">
            <div className="font-bold text-white text-base mb-[15px]">
              (2) Автонастрйока
            </div>
            <div className="font-normal text-gray-400 w-[355px] mb-[40px]">
              Чтобы все заработало, в Cloudflare будет выполнен ряд
              автоматических настроек для вашего домена. Для продолжения нажмите
              кнопку ниже. Посмотреть API ключ можно
              <span className="underline cursor-pointer">
                в вашем ЛК Cloudflare
              </span>
              . Вам будет нужен Global API key.
            </div>
            <div className="flex gap-[30px]">
              <button className="bg-[#383B66] hover:bg-[#515ACA]  text-white rounded-lg text-base py-3 px-[38px] h-[42px] flex items-center">
                Автонастройка
              </button>
              <button className="bg-white hover:bg-[#00FF11] text-[#121320] rounded-lg text-base py-3 px-[38px] whitespace-nowrap flex item">
                Сохранить и продолжить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainOption;
